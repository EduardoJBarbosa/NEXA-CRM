import { Request, Response, NextFunction } from 'express'
import jwt from 'jwt-simple'
import { AuthRequest, UserRole } from '../types/index.js'

declare global {
  namespace Express {
    interface Request {
      user?: AuthRequest
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET || 'secret') as any
    req.user = {
      userId: decoded.id,
      userRole: decoded.role as UserRole,
    }
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
