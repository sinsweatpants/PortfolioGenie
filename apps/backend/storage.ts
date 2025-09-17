import {
  users,
  portfolios,
  projects,
  templates,
  type User,
  type UpsertUser,
  type Portfolio,
  type InsertPortfolio,
  type Project,
  type InsertProject,
  type Template,
  type InsertTemplate,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Portfolio operations
  getUserPortfolios(userId: string): Promise<Portfolio[]>;
  getPortfolio(id: string): Promise<Portfolio | undefined>;
  getPortfolioBySlug(slug: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: string, updates: Partial<InsertPortfolio>): Promise<Portfolio>;
  deletePortfolio(id: string): Promise<void>;
  incrementPortfolioViews(id: string): Promise<void>;
  
  // Project operations
  getPortfolioProjects(portfolioId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  incrementTemplateUsage(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Portfolio operations
  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.updatedAt));
  }

  async getPortfolio(id: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, id));
    return portfolio;
  }

  async getPortfolioBySlug(slug: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.slug, slug));
    return portfolio;
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db
      .insert(portfolios)
      .values(portfolio)
      .returning();
    return newPortfolio;
  }

  async updatePortfolio(id: string, updates: Partial<InsertPortfolio>): Promise<Portfolio> {
    const [portfolio] = await db
      .update(portfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio;
  }

  async deletePortfolio(id: string): Promise<void> {
    await db.delete(portfolios).where(eq(portfolios.id, id));
  }

  async incrementPortfolioViews(id: string): Promise<void> {
    await db
      .update(portfolios)
      .set({
        viewCount: sql`${portfolios.viewCount} + 1`,
      })
      .where(eq(portfolios.id, id));
  }

  // Project operations
  async getPortfolioProjects(portfolioId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.portfolioId, portfolioId))
      .orderBy(projects.order, projects.createdAt);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, true))
      .orderBy(desc(templates.usageCount));
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(and(eq(templates.category, category), eq(templates.isActive, true)))
      .orderBy(desc(templates.usageCount));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await db
      .update(templates)
      .set({
        usageCount: sql`${templates.usageCount} + 1`,
      })
      .where(eq(templates.id, id));
  }
}

export const storage = new DatabaseStorage();
