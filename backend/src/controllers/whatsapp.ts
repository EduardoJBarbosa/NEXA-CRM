import { Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class WhatsAppController {
  static async webhook(req: Request, res: Response) {
    try {
      const { nome, telefone, mensagem, origem } = req.body

      if (!nome || !telefone || !mensagem) {
        return res.status(400).json({ error: 'Nome, telefone e mensagem são obrigatórios' })
      }

      let patient = await prisma.patient.findFirst({
        where: { phone: telefone }
      })

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            name: nome,
            phone: telefone,
            leadSource: origem || 'WHATSAPP',
            tags: 'whatsapp'
          }
        })

        const procedure = await prisma.procedure.findFirst()
        if (procedure) {
          await prisma.lead.create({
            data: {
              patientId: patient.id,
              procedureId: procedure.id,
              status: 'NOVO',
              estimatedValue: procedure.estimatedPrice,
              leadSource: origem || 'WHATSAPP',
              notes: `Mensagem WhatsApp: ${mensagem}`
            }
          })
        }
      } else {
        const lead = await prisma.lead.findFirst({
          where: { patientId: patient.id }
        })

        if (lead) {
          await prisma.interaction.create({
            data: {
              leadId: lead.id,
              patientId: patient.id,
              type: 'NOTE',
              description: `WhatsApp: ${mensagem}`
            }
          })
        }
      }

      res.status(200).json({ success: true, message: 'Mensagem processada' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
}
