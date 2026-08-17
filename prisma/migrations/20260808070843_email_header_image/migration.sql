-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "headerImageUrl" TEXT NOT NULL DEFAULT '',
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
INSERT INTO "new_EmailCampaign" ("body", "bounceCount", "createdAt", "deliveredCount", "footerImageUrl", "id", "imageUrl", "openCount", "recipientCount", "sentAt", "status", "subject", "updatedAt") SELECT "body", "bounceCount", "createdAt", "deliveredCount", "footerImageUrl", "id", "imageUrl", "openCount", "recipientCount", "sentAt", "status", "subject", "updatedAt" FROM "EmailCampaign";
DROP TABLE "EmailCampaign";
ALTER TABLE "new_EmailCampaign" RENAME TO "EmailCampaign";
CREATE TABLE "new_EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "headerImageUrl" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "footerImageUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_EmailTemplate" ("body", "createdAt", "footerImageUrl", "id", "imageUrl", "name", "subject", "updatedAt") SELECT "body", "createdAt", "footerImageUrl", "id", "imageUrl", "name", "subject", "updatedAt" FROM "EmailTemplate";
DROP TABLE "EmailTemplate";
ALTER TABLE "new_EmailTemplate" RENAME TO "EmailTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
