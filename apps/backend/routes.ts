import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, authenticateToken, type AuthenticatedRequest } from "./auth";
import { insertPortfolioSchema, insertProjectSchema, insertTemplateSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

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
  app.post('/api/upload', authenticateToken, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // In a real application, you'd upload to cloud storage (S3, etc.)
      // For now, return a placeholder URL
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}