import { Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jwt-simple'
import bcrypt from 'bcrypt'
import { asaasService } from '../services/asaas.js'
import { addDays } from 'date-fns'

const prisma = new PrismaClient()

export class TenantsController {
  static async register(req: Request, res: Response) {
    try {
      const { tenantName, tenantSlug, adminName, adminEmail, adminPassword } = req.body

      if (!tenantName || !tenantSlug || !adminName || !adminEmail || !adminPassword) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      const existingTenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      })

      if (existingTenant) {
        return res.status(409).json({ error: 'Slug de tenant já existe' })
      }

      const existingUser = await prisma.user.findFirst({
        where: { email: adminEmail },
      })

      if (existingUser) {
        return res.status(409).json({ error: 'Email já registrado' })
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 10)

      const result = await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: tenantName,
            slug: tenantSlug,
            plan: 'TRIAL',
            planExpiresAt: addDays(new Date(), 14),
          },
        })

        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
          },
        })

        // Create initial trial subscription
        const subscription = await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            plan: 'TRIAL',
            status: 'TRIALING',
            currentPeriodStart: new Date(),
            currentPeriodEnd: addDays(new Date(), 14),
            trialEnd: addDays(new Date(), 14),
          },
        })

        return { tenant, user, subscription }
      })

      // Try to create Asaas customer (non-blocking)
      try {
        const asaasCustomerId = await asaasService.createCustomer(
          result.tenant.id,
          tenantName,
          adminEmail,
        )

        // Update tenant with Asaas customer ID
        await prisma.tenant.update({
          where: { id: result.tenant.id },
          data: { asaasCustomerId },
        })
      } catch (asaasError: any) {
        console.error('Failed to create Asaas customer:', asaasError.message)
        // Continue anyway - trial works without Asaas
      }

      const token = jwt.encode(
        {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          tenantId: result.tenant.id,
          iat: Date.now(),
        },
        process.env.JWT_SECRET || 'secret',
      )

      res.status(201).json({
        token,
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          plan: 'TRIAL',
        },
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      })
    } catch (error: any) {
      console.error('ERRO AO REGISTRAR TENANT:', error)
      res.status(500).json({ error: error.message })
    }
  }

  static async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.query

      if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ error: 'Slug é obrigatório' })
      }

      const tenant = await prisma.tenant.findUnique({
        where: { slug },
      })

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant não encontrado' })
      }

      res.json(tenant)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
}
