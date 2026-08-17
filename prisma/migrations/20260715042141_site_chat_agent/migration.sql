/*
  Warnings:

  - You are about to drop the `WhatsAppContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhatsAppMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `whatsappAgentInfo` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "WhatsAppContact_phone_key";

-- DropIndex
DROP INDEX "WhatsAppMessage_contactId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WhatsAppContact";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WhatsAppMessage";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "customerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatSession_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "shippingFee" REAL NOT NULL DEFAULT 25,
    "pagoTarjeta" BOOLEAN NOT NULL DEFAULT true,
    "agentInfo" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("id", "pagoTarjeta", "shippingFee", "updatedAt") SELECT "id", "pagoTarjeta", "shippingFee", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_visitorId_key" ON "ChatSession"("visitorId");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");
