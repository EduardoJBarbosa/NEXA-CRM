import { Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jwt-simple'

const prisma = new PrismaClient()

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      const user = await prisma.user.findUnique({ where: { email } })

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = jwt.encode(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          iat: Date.now(),
        },
        process.env.JWT_SECRET || 'secret',
      )

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async logout(req: Request, res: Response) {
    res.json({ message: 'Logged out' })
  }
}
