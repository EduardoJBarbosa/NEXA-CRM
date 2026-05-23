-- AlterTable: Add subscription columns to Tenant
ALTER TABLE "Tenant" ADD COLUMN "planExpiresAt" DATETIME;
ALTER TABLE "Tenant" ADD COLUMN "asaasCustomerId" TEXT;
ALTER TABLE "Tenant" RENAME COLUMN "plan" TO "plan_old";
ALTER TABLE "Tenant" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'TRIAL';

-- CreateTable: Subscription
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TRIALING',
    "plan" TEXT NOT NULL,
    "asaasSubscriptionId" TEXT,
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "trialEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Plan
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "interval" TEXT NOT NULL DEFAULT 'MONTH',
    "features" TEXT NOT NULL,
    "asaasPlanId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create unique indexes
CREATE UNIQUE INDEX "Tenant_asaasCustomerId_key" ON "Tenant"("asaasCustomerId");
CREATE UNIQUE INDEX "Subscription_tenantId_key" ON "Subscription"("tenantId");
CREATE UNIQUE INDEX "Subscription_asaasSubscriptionId_key" ON "Subscription"("asaasSubscriptionId");
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
CREATE UNIQUE INDEX "Plan_asaasPlanId_key" ON "Plan"("asaasPlanId");

-- Create indexes
CREATE INDEX "Subscription_tenantId_idx" ON "Subscription"("tenantId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Plan_active_idx" ON "Plan"("active");

-- Add index to Tenant
CREATE INDEX "Tenant_plan_idx" ON "Tenant"("plan");
