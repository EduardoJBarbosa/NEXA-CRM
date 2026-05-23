import { Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jwt-simple'
import bcrypt from 'bcrypt'
import 'dotenv/config';

const prisma = new PrismaClient()



export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password, tenantSlug } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' })
      }

      let tenantId: string | null = null

      if (tenantSlug) {
        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        })

        if (!tenant) {
          return res.status(404).json({ error: 'Tenant não encontrado' })
        }

        tenantId = tenant.id
      }

      const whereClause: any = { email }
      if (tenantId) {
        whereClause.tenantId = tenantId
      }

      const user = await prisma.user.findFirst({
        where: whereClause,
        include: { tenant: true },
      })

      if (!user || !user.password) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }

      const payload: any = {
        id: user.id,
        email: user.email,
        role: user.role,
        iat: Date.now(),
      }

      if (user.tenantId) {
        payload.tenantId = user.tenantId
      }

      const token = jwt.encode(payload, process.env.JWT_SECRET || 'secret')

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async logout(req: Request, res: Response) {
    res.json({ message: 'Logged out' })
  }
}
