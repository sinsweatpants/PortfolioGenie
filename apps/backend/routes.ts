import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, authenticateToken, type AuthenticatedRequest } from "./auth";
import { insertPortfolioSchema, insertProjectSchema, insertTemplateSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import {
  generateText,
  generateTemplateIdeas,
  translateText,
  suggestContentImprovements,
  generatePerformanceSuggestions,
  generateAccessibilitySuggestions,
} from "./ai";
import { analyzePerformance, analyzeAccessibility } from "./analysis";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // User profile route
  app.get('/api/auth/user', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolios', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolios = await storage.getUserPortfolios(req.user!.id);
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.get('/api/portfolios/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      // Check if user owns this portfolio
      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post('/api/portfolios', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolioData = insertPortfolioSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const portfolio = await storage.createPortfolio(portfolioData);
      res.status(201).json(portfolio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid portfolio data", errors: error.errors });
      }
      console.error("Error creating portfolio:", error);
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });

  app.patch('/api/portfolios/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      // Check if user owns this portfolio
      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updates = insertPortfolioSchema.partial().parse(req.body);
      const updatedPortfolio = await storage.updatePortfolio(req.params.id, updates);
      res.json(updatedPortfolio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid portfolio data", errors: error.errors });
      }
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Failed to update portfolio" });
    }
  });

  app.delete('/api/portfolios/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      // Check if user owns this portfolio
      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deletePortfolio(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      res.status(500).json({ message: "Failed to delete portfolio" });
    }
  });

  // Public portfolio viewing (no auth required)
  app.get('/api/public/portfolios/:slug', async (req, res) => {
    try {
      const portfolio = await storage.getPortfolioBySlug(req.params.slug);
      if (!portfolio || !portfolio.isPublished) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      // Increment view count
      await storage.incrementPortfolioViews(portfolio.id);
      
      // Get portfolio projects
      const projects = await storage.getPortfolioProjects(portfolio.id);
      
      res.json({ ...portfolio, projects });
    } catch (error) {
      console.error("Error fetching public portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Project routes
  app.get('/api/portfolios/:portfolioId/projects', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      // Check if user owns this portfolio
      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const projects = await storage.getPortfolioProjects(req.params.portfolioId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/portfolios/:portfolioId/projects', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      // Check if user owns this portfolio
      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        portfolioId: req.params.portfolioId,
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch('/api/projects/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the portfolio this project belongs to
      const portfolio = await storage.getPortfolio(project.portfolioId);
      if (!portfolio || portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updates = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(req.params.id, updates);
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the portfolio this project belongs to
      const portfolio = await storage.getPortfolio(project.portfolioId);
      if (!portfolio || portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Template routes
  app.get('/api/templates', async (req, res) => {
    try {
      const category = req.query.category as string;
      const templates = category 
        ? await storage.getTemplatesByCategory(category)
        : await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // File upload route
  app.post('/api/upload', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      res.json({
        url: fileUrl,
        originalSize: req.file.size,
        optimizedSize: req.file.size,
        width: null,
        height: null,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // AI assistance routes
  app.post('/api/ai/generate-text', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1),
        tone: z.string().optional(),
        length: z.enum(['short', 'medium', 'long']).optional(),
        existingText: z.string().optional(),
      });

      const payload = schema.parse(req.body);
      const text = await generateText(payload);
      res.json({ text });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error generating text:", error);
      res.status(500).json({ message: "Failed to generate text" });
    }
  });

  app.post('/api/ai/content-improvements', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({ content: z.string().min(1) });
      const { content } = schema.parse(req.body);
      const suggestions = await suggestContentImprovements(content);
      res.json({ suggestions });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error suggesting improvements:", error);
      res.status(500).json({ message: "Failed to analyze content" });
    }
  });

  app.post('/api/ai/templates', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        industry: z.string().min(1),
        goals: z.string().optional(),
        tone: z.string().optional(),
        mustHaveSections: z.array(z.string()).optional(),
      });

      const payload = schema.parse(req.body);
      const outline = await generateTemplateIdeas(payload);
      res.json({ outline });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error generating template ideas:", error);
      res.status(500).json({ message: "Failed to generate template suggestions" });
    }
  });

  app.post('/api/ai/translate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        text: z.string().min(1),
        targetLanguage: z.string().min(1),
        sourceLanguage: z.string().optional(),
      });

      const payload = schema.parse(req.body);
      const translated = await translateText(payload);
      res.json({ translated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error translating text:", error);
      res.status(500).json({ message: "Failed to translate text" });
    }
  });

  // Analysis routes
  app.post('/api/analysis/performance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({ portfolioId: z.string().min(1) });
      const { portfolioId } = schema.parse(req.body);

      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const projects = await storage.getPortfolioProjects(portfolioId);
      const report = analyzePerformance(portfolio, projects);
      let aiAdvice: string | null = null;

      try {
        aiAdvice = await generatePerformanceSuggestions({
          projectCount: report.projectCount,
          averageDescriptionLength: report.averageDescriptionLength,
          hasLargeImages: report.hasLargeImages,
          customScripts: report.customScriptBlocks,
        });
      } catch (aiError) {
        console.warn("AI performance suggestion failed", aiError);
      }

      res.json({ report, aiAdvice });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error analyzing performance:", error);
      res.status(500).json({ message: "Failed to analyze performance" });
    }
  });

  app.post('/api/analysis/accessibility', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({ portfolioId: z.string().min(1) });
      const { portfolioId } = schema.parse(req.body);

      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const projects = await storage.getPortfolioProjects(portfolioId);
      const report = analyzeAccessibility(portfolio, projects);
      let aiAdvice: string | null = null;

      try {
        aiAdvice = await generateAccessibilitySuggestions({
          missingAltTags: report.missingAltTags,
          lowContrastPairs: report.lowContrastPairs,
          headingIssues: report.headingIssues,
        });
      } catch (aiError) {
        console.warn("AI accessibility suggestion failed", aiError);
      }

      res.json({ report, aiAdvice });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error analyzing accessibility:", error);
      res.status(500).json({ message: "Failed to analyze accessibility" });
    }
  });

  // Portfolio versioning
  app.get('/api/portfolios/:id/versions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const versions = await storage.getPortfolioVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ message: "Failed to fetch versions" });
    }
  });

  app.post('/api/portfolios/:id/versions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const schema = z.object({
        title: z.string().optional(),
        summary: z.string().optional(),
      });

      const payload = schema.parse(req.body);
      const snapshot = {
        name: portfolio.name,
        description: portfolio.description,
        slug: portfolio.slug,
        templateId: portfolio.templateId,
        isPublished: portfolio.isPublished,
        customization: portfolio.customization,
      };

      const version = await storage.createPortfolioVersion({
        portfolioId: portfolio.id,
        title: payload.title || `Snapshot ${new Date().toLocaleString()}`,
        summary: payload.summary,
        snapshot,
      });

      res.status(201).json(version);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error creating portfolio version:", error);
      res.status(500).json({ message: "Failed to create portfolio version" });
    }
  });

  app.post('/api/portfolios/:id/versions/:versionId/revert', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const version = await storage.getPortfolioVersion(req.params.versionId);
      if (!version || version.portfolioId !== portfolio.id) {
        return res.status(404).json({ message: "Version not found" });
      }

      const revertSchema = z.object({
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        slug: z.string().optional(),
        templateId: z.string().nullable().optional(),
        isPublished: z.boolean().optional(),
        customization: z.any().optional(),
      });

      const snapshot = revertSchema.parse(version.snapshot);
      const updatedPortfolio = await storage.updatePortfolio(portfolio.id, snapshot);

      res.json(updatedPortfolio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid snapshot data", errors: error.errors });
      }
      console.error("Error reverting portfolio:", error);
      res.status(500).json({ message: "Failed to revert portfolio" });
    }
  });

  app.get('/api/portfolios/:id/export', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      if (portfolio.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const projects = await storage.getPortfolioProjects(portfolio.id);
      const format = (req.query.format as string) || 'json';
      const payload = { portfolio, projects };

      if (format === 'markdown') {
        const markdown = [
          `# ${portfolio.name}`,
          portfolio.description ? `\n${portfolio.description}` : '',
          '',
          '## Projects',
          ...projects.map((project, index) => {
            const lines = [`${index + 1}. **${project.title}**`];
            if (project.description) {
              lines.push(`   - ${project.description}`);
            }
            if (project.projectUrl) {
              lines.push(`   - URL: ${project.projectUrl}`);
            }
            return lines.join('\n');
          }),
        ].join('\n');

        res.setHeader('Content-Type', 'text/markdown');
        return res.send(markdown);
      }

      if (format === 'html') {
        const projectCards = projects
          .map(
            (project) => `
          <section>
            <h2>${project.title}</h2>
            ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" />` : ''}
            ${project.description ? `<p>${project.description}</p>` : ''}
            ${project.projectUrl ? `<p><a href="${project.projectUrl}">View project</a></p>` : ''}
          </section>
        `,
          )
          .join('\n');

        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${portfolio.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 2rem; }
            section { margin-bottom: 2rem; }
            img { max-width: 100%; height: auto; border-radius: 0.5rem; }
          </style>
        </head>
        <body>
          <header>
            <h1>${portfolio.name}</h1>
            ${portfolio.description ? `<p>${portfolio.description}</p>` : ''}
          </header>
          ${projectCards}
        </body>
        </html>`;

        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
      }

      res.json(payload);
    } catch (error) {
      console.error("Error exporting portfolio:", error);
      res.status(500).json({ message: "Failed to export portfolio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}