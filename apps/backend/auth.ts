import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { Express, Request, Response, NextFunction } from 'express'
import { storage } from './storage'
import { registerSchema, loginSchema } from '@shared/schema'

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key') {
  console.warn('WARNING: Using default JWT secret. Please set JWT_SECRET environment variable.')
}

// JWT utilities
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded
  } catch (error) {
    return null
  }
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Auth middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'Access token required' })
    return
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  try {
    const user = await storage.getUser(decoded.userId)
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    req.user = {
      id: user.id,
      email: user.email!,
      firstName: user.firstName,
      lastName: user.lastName,
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      try {
        const user = await storage.getUser(decoded.userId)
        if (user) {
          req.user = {
            id: user.id,
            email: user.email!,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        }
      } catch (error) {
        console.error('Optional auth error:', error)
      }
    }
  }

  next()
}

// Setup authentication routes
export function setupAuth(app: Express): void {
  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedData = registerSchema.parse(req.body)
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email)
      if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists' })
        return
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password)

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      })

      // Generate token
      const token = generateToken(user.id)

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        })
        return
      }
      
      res.status(500).json({ error: 'Registration failed' })
    }
  })

  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body)
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email)
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' })
        return
      }

      // Check password
      const isValidPassword = await comparePassword(validatedData.password, user.password)
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' })
        return
      }

      // Generate token
      const token = generateToken(user.id)

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      })
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        })
        return
      }
      
      res.status(500).json({ error: 'Login failed' })
    }
  })

  // Get current user endpoint
  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      user: req.user,
    })
  })

  // Logout endpoint (client-side token removal)
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({ message: 'Logout successful' })
  })
}

// Legacy compatibility
export const isAuthenticated = authenticateToken