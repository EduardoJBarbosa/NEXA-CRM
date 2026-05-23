-- AlterTable
ALTER TABLE "User" ADD COLUMN "whatsappApiToken" TEXT;
ALTER TABLE "User" ADD COLUMN "whatsappWebhookUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT,
    "procedureId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "estimatedValue" REAL NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "assignedTo" TEXT,
    "leadSource" TEXT NOT NULL DEFAULT 'ORGANICO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lead_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("assignedTo", "createdAt", "estimatedValue", "id", "leadSource", "notes", "patientId", "procedureId", "status", "updatedAt") SELECT "assignedTo", "createdAt", "estimatedValue", "id", "leadSource", "notes", "patientId", "procedureId", "status", "updatedAt" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_patientId_key" ON "Lead"("patientId");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_patientId_idx" ON "Lead"("patientId");
CREATE INDEX "Lead_procedureId_idx" ON "Lead"("procedureId");
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "birthDate" DATETIME,
    "cpf" TEXT,
    "leadSource" TEXT NOT NULL DEFAULT 'ORGANICO',
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Patient" ("birthDate", "cpf", "createdAt", "email", "id", "leadSource", "name", "phone", "tags", "updatedAt") SELECT "birthDate", "cpf", "createdAt", "email", "id", "leadSource", "name", "phone", "tags", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_cpf_key" ON "Patient"("cpf");
CREATE INDEX "Patient_name_idx" ON "Patient"("name");
CREATE INDEX "Patient_email_idx" ON "Patient"("email");
CREATE TABLE "new_Procedure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedPrice" REAL NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "valor" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Procedure" ("category", "createdAt", "estimatedPrice", "id", "name", "updatedAt") SELECT "category", "createdAt", "estimatedPrice", "id", "name", "updatedAt" FROM "Procedure";
DROP TABLE "Procedure";
ALTER TABLE "new_Procedure" RENAME TO "Procedure";
CREATE INDEX "Procedure_category_idx" ON "Procedure"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
