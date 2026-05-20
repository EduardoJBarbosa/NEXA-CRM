import { Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ProceduresController {
  static async getAll(req: Request, res: Response) {
    try {
      const procedures = await prisma.procedure.findMany({
        orderBy: { name: 'asc' },
      })
      res.json({ procedures })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const procedure = await prisma.procedure.findUnique({
        where: { id: req.params.id },
      })
      if (!procedure) return res.status(404).json({ error: 'Procedure not found' })
      res.json(procedure)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, category, estimatedPrice } = req.body

      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' })
      }

      const procedure = await prisma.procedure.create({
        data: {
          name,
          category,
          estimatedPrice: estimatedPrice || 0,
        },
      })

      res.status(201).json(procedure)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { name, category, estimatedPrice } = req.body

      const procedure = await prisma.procedure.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name }),
          ...(category && { category }),
          ...(estimatedPrice !== undefined && { estimatedPrice }),
        },
      })

      res.json(procedure)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await prisma.procedure.delete({
        where: { id: req.params.id },
      })

      res.json({ message: 'Procedure deleted' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
}
