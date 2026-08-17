-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL,
    "cost" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "action" TEXT NOT NULL DEFAULT '',
    "actionEs" TEXT NOT NULL DEFAULT '',
    "blurb" TEXT NOT NULL DEFAULT '',
    "blurbEs" TEXT NOT NULL DEFAULT '',
    "bullets" TEXT NOT NULL DEFAULT '[]',
    "bulletsEs" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT NOT NULL DEFAULT '',
    "noteEs" TEXT NOT NULL DEFAULT '',
    "statValue" TEXT NOT NULL DEFAULT '',
    "statLabel" TEXT NOT NULL DEFAULT '',
    "statLabelEs" TEXT NOT NULL DEFAULT '',
    "concentration" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT '',
    "frequencyEs" TEXT NOT NULL DEFAULT '',
    "dose" TEXT NOT NULL DEFAULT '',
    "doseEs" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "durationEs" TEXT NOT NULL DEFAULT '',
    "breakPeriod" TEXT NOT NULL DEFAULT '',
    "breakPeriodEs" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Product" ("action", "actionEs", "active", "blurb", "blurbEs", "bullets", "bulletsEs", "category", "cost", "createdAt", "currency", "id", "imageUrl", "name", "note", "noteEs", "price", "slug", "statLabel", "statLabelEs", "statValue", "stock", "updatedAt") SELECT "action", "actionEs", "active", "blurb", "blurbEs", "bullets", "bulletsEs", "category", "cost", "createdAt", "currency", "id", "imageUrl", "name", "note", "noteEs", "price", "slug", "statLabel", "statLabelEs", "statValue", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
