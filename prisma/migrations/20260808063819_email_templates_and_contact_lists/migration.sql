-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "footerImageUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContactList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContactListMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactListMember_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ContactList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContactListMember_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "footerImageUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" DATETIME,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "bounceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_EmailCampaign" ("body", "bounceCount", "createdAt", "deliveredCount", "id", "imageUrl", "openCount", "recipientCount", "sentAt", "status", "subject", "updatedAt") SELECT "body", "bounceCount", "createdAt", "deliveredCount", "id", "imageUrl", "openCount", "recipientCount", "sentAt", "status", "subject", "updatedAt" FROM "EmailCampaign";
DROP TABLE "EmailCampaign";
ALTER TABLE "new_EmailCampaign" RENAME TO "EmailCampaign";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ContactListMember_listId_customerId_key" ON "ContactListMember"("listId", "customerId");
