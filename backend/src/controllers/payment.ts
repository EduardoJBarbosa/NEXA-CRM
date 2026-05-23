import { Response, Request } from 'express'
import { PrismaClient } from '@prisma/client'
import { asaasService } from '../services/asaas.js'
import { createSubscriptionSchema, webhookSchema } from '../schemas/index.js'
import { addDays } from 'date-fns'

const prisma = new PrismaClient()

export class PaymentController {
  static async listPlans(req: Request, res: Response) {
    try {
      const plans = await prisma.plan.findMany({
        where: { active: true },
        orderBy: { price: 'asc' },
      })

      if (plans.length === 0) {
        return res.status(200).json({
          plans: [
            {
              id: 'plan_trial',
              name: 'TRIAL',
              price: 0,
              interval: 'MONTH',
              features: 'Até 100 pacientes, até 5 usuários',
            },
            {
              id: 'plan_starter',
              name: 'STARTER',
              price: 99,
              interval: 'MONTH',
              features: 'Até 500 pacientes, até 15 usuários, suporte por email',
            },
            {
              id: 'plan_pro',
              name: 'PRO',
              price: 299,
              interval: 'MONTH',
              features: 'Pacientes ilimitados, usuários ilimitados, suporte prioritário',
            },
          ],
        })
      }

      res.json({ plans })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async getCurrentSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' })
      }

      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
        include: {
          tenant: true,
        },
      })

      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' })
      }

      const daysRemaining =
        subscription.trialEnd && subscription.status === 'TRIALING'
          ? Math.max(
              0,
              Math.ceil((subscription.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            )
          : 0

      res.json({
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
          daysRemaining,
        },
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async createSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' })
      }

      const validated = createSubscriptionSchema.parse(req.body)
      const { planId } = validated

      // Check if tenant already has active subscription
      const existingSubscription = await prisma.subscription.findUnique({
        where: { tenantId },
      })

      if (existingSubscription && existingSubscription.status === 'ACTIVE') {
        return res.status(409).json({ error: 'Tenant already has an active subscription' })
      }

      // Get tenant info
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      })

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' })
      }

      // Determine if trial or paid plan
      const isTrialPlan = planId === 'plan_trial'

      let asaasSubscriptionId: string | null = null
      let status = 'TRIALING'
      let currentPeriodEnd = addDays(new Date(), 14)

      if (!isTrialPlan && tenant.asaasCustomerId) {
        try {
          // Create paid subscription in Asaas
          const asaasSubscription = await asaasService.createSubscription(
            tenant.asaasCustomerId,
            planId,
          )

          asaasSubscriptionId = asaasSubscription.id
          status = asaasService.mapAsaasStatusToLocal(asaasSubscription.status)

          // Parse Asaas date
          if (asaasSubscription.nextDueDate) {
            currentPeriodEnd = new Date(asaasSubscription.nextDueDate)
          }
        } catch (asaasError: any) {
          console.error('Asaas subscription error:', asaasError.message)
          return res
            .status(402)
            .json({ error: `Payment processing failed: ${asaasError.message}` })
        }
      }

      // Update or create subscription in DB
      const subscription = await prisma.subscription.upsert({
        where: { tenantId },
        update: {
          plan: planId,
          status,
          asaasSubscriptionId,
          currentPeriodEnd,
          trialEnd: isTrialPlan ? addDays(new Date(), 14) : null,
        },
        create: {
          tenantId,
          plan: planId,
          status,
          asaasSubscriptionId,
          currentPeriodStart: new Date(),
          currentPeriodEnd,
          trialEnd: isTrialPlan ? addDays(new Date(), 14) : null,
        },
      })

      // Update tenant plan
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          plan: planId.replace('plan_', '').toUpperCase(),
          planExpiresAt: currentPeriodEnd,
        },
      })

      res.status(201).json({
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
        },
      })
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ error: error.errors[0].message })
      }
      res.status(500).json({ error: error.message })
    }
  }

  static async cancelSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId
      const user = req.user

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' })
      }

      if (user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can cancel subscriptions' })
      }

      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
      })

      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' })
      }

      // Cancel in Asaas if exists
      if (subscription.asaasSubscriptionId) {
        try {
          await asaasService.cancelSubscription(subscription.asaasSubscriptionId)
        } catch (asaasError: any) {
          console.error('Asaas cancellation error:', asaasError.message)
          // Continue even if Asaas fails, update local DB
        }
      }

      // Update subscription status
      await prisma.subscription.update({
        where: { tenantId },
        data: {
          status: 'CANCELLED',
        },
      })

      // Update tenant plan back to TRIAL
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          plan: 'TRIAL',
          planExpiresAt: null,
        },
      })

      res.json({ success: true, message: 'Subscription cancelled' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  static async webhook(req: Request, res: Response) {
    try {
      const signature = req.headers['asaas-signature'] as string
      if (!signature) {
        return res.status(400).json({ error: 'Missing webhook signature' })
      }

      // Verify webhook signature
      const isValid = asaasService.verifyWebhookSignature(req.body, signature)
      if (!isValid) {
        console.warn('Invalid webhook signature')
        // Continue anyway for development, but log warning
      }

      const event = req.body.event
      const data = req.body.data

      console.log('Webhook received:', event, data)

      switch (event) {
        case 'subscription.confirmed':
        case 'subscription.activated':
          await PaymentController.handleSubscriptionConfirmed(data)
          break

        case 'subscription.expired':
          await PaymentController.handleSubscriptionExpired(data)
          break

        case 'subscription.cancelled':
          await PaymentController.handleSubscriptionCancelled(data)
          break

        case 'payment.confirmed':
          await PaymentController.handlePaymentConfirmed(data)
          break

        default:
          console.log('Unknown webhook event:', event)
      }

      res.status(200).json({ ok: true })
    } catch (error: any) {
      console.error('Webhook error:', error)
      res.status(500).json({ error: error.message })
    }
  }

  private static async handleSubscriptionConfirmed(data: any) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { asaasSubscriptionId: data.id },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
          },
        })

        await prisma.tenant.update({
          where: { id: subscription.tenantId },
          data: {
            plan: data.plan?.name || 'ACTIVE',
          },
        })
      }
    } catch (error) {
      console.error('Error handling subscription confirmed:', error)
    }
  }

  private static async handleSubscriptionExpired(data: any) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { asaasSubscriptionId: data.id },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'EXPIRED',
          },
        })

        await prisma.tenant.update({
          where: { id: subscription.tenantId },
          data: {
            plan: 'TRIAL',
          },
        })
      }
    } catch (error) {
      console.error('Error handling subscription expired:', error)
    }
  }

  private static async handleSubscriptionCancelled(data: any) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { asaasSubscriptionId: data.id },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'CANCELLED',
          },
        })

        await prisma.tenant.update({
          where: { id: subscription.tenantId },
          data: {
            plan: 'TRIAL',
          },
        })
      }
    } catch (error) {
      console.error('Error handling subscription cancelled:', error)
    }
  }

  private static async handlePaymentConfirmed(data: any) {
    try {
      // Update payment status if needed
      console.log('Payment confirmed:', data.id)
    } catch (error) {
      console.error('Error handling payment confirmed:', error)
    }
  }
}
