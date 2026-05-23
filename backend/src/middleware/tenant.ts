import { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      tenantId?: string
    }
  }
}

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string

  if (!tenantId) {
    return res.status(400).json({ error: 'X-Tenant-Id header is required' })
  }

  req.tenantId = tenantId
  next()
}
