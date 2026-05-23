import axios, { AxiosInstance } from 'axios'
import crypto from 'crypto'

interface AsaasCustomer {
  id: string
  name: string
  email?: string
  cpf?: string
}

interface AsaasPlan {
  id: string
  name: string
  value: number
  interval: string
  description?: string
  billingType?: string
}

interface AsaasSubscription {
  id: string
  customer: string
  plan: string
  value: number
  status: string
  nextDueDate: string
  externalReference?: string
}

export class AsaasService {
  private client: AxiosInstance

  constructor() {
    const apiKey = process.env.ASAAS_API_KEY
    const baseURL = process.env.ASAAS_API_BASE_URL || 'https://api.asaas.com/v3'

    if (!apiKey) {
      throw new Error('ASAAS_API_KEY env var is required')
    }

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })
  }

  async createCustomer(tenantId: string, name: string, email?: string): Promise<string> {
    try {
      const response = await this.client.post('/customers', {
        name,
        email: email || `${tenantId}@nexa.local`,
        externalReference: tenantId,
      })

      return response.data.id
    } catch (error: any) {
      const message = error.response?.data?.errors?.[0]?.description || error.message
      throw new Error(`Failed to create Asaas customer: ${message}`)
    }
  }

  async listPlans(): Promise<AsaasPlan[]> {
    try {
      const response = await this.client.get('/plans')
      return response.data.data || response.data
    } catch (error: any) {
      const message = error.response?.data?.errors?.[0]?.description || error.message
      throw new Error(`Failed to list Asaas plans: ${message}`)
    }
  }

  async createSubscription(
    asaasCustomerId: string,
    asaasPlanId: string,
    billingCycle?: number,
  ): Promise<AsaasSubscription> {
    try {
      const payload: any = {
        customer: asaasCustomerId,
        plan: asaasPlanId,
        billingType: 'MONTHLY',
      }

      if (billingCycle) {
        payload.billingCycle = billingCycle
      }

      const response = await this.client.post('/subscriptions', payload)

      return response.data
    } catch (error: any) {
      const message = error.response?.data?.errors?.[0]?.description || error.message
      throw new Error(`Failed to create Asaas subscription: ${message}`)
    }
  }

  async cancelSubscription(asaasSubscriptionId: string): Promise<boolean> {
    try {
      await this.client.delete(`/subscriptions/${asaasSubscriptionId}`)
      return true
    } catch (error: any) {
      const message = error.response?.data?.errors?.[0]?.description || error.message
      throw new Error(`Failed to cancel Asaas subscription: ${message}`)
    }
  }

  async getSubscription(asaasSubscriptionId: string): Promise<AsaasSubscription> {
    try {
      const response = await this.client.get(`/subscriptions/${asaasSubscriptionId}`)
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.errors?.[0]?.description || error.message
      throw new Error(`Failed to get Asaas subscription: ${message}`)
    }
  }

  async getCustomer(asaasCustomerId: string): Promise<AsaasCustomer> {
    try {
      const response = await this.client.get(`/customers/${asaasCustomerId}`)
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.errors?.[0]?.description || error.message
      throw new Error(`Failed to get Asaas customer: ${message}`)
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    const secret = process.env.ASAAS_WEBHOOK_SECRET
    if (!secret) {
      console.warn('ASAAS_WEBHOOK_SECRET not configured, skipping verification')
      return true
    }

    try {
      const payloadString = JSON.stringify(payload)
      const hash = crypto.createHmac('sha256', secret).update(payloadString).digest('hex')

      return hash === signature
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return false
    }
  }

  mapAsaasStatusToLocal(asaasStatus: string): string {
    const statusMap: { [key: string]: string } = {
      ACTIVE: 'ACTIVE',
      PENDING: 'TRIALING',
      EXPIRED: 'EXPIRED',
      CANCELLED: 'CANCELLED',
      FAILED: 'FAILED',
    }

    return statusMap[asaasStatus] || asaasStatus
  }
}

export const asaasService = new AsaasService()
