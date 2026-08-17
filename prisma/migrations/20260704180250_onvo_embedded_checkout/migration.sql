/*
  Warnings:

  - You are about to drop the column `onvoCheckoutSessionId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `onvoPaymentId` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "onvoCustomerId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL DEFAULT '',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "shippingCharge" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT NOT NULL DEFAULT '',
    "shippingName" TEXT NOT NULL DEFAULT '',
    "shippingAddress" TEXT NOT NULL DEFAULT '',
    "shippingCity" TEXT NOT NULL DEFAULT '',
    "shippingState" TEXT NOT NULL DEFAULT '',
    "shippingZip" TEXT NOT NULL DEFAULT '',
    "shippingCountry" TEXT NOT NULL DEFAULT '',
    "onvoPaymentIntentId" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "currency", "customerId", "deliveryStatus", "emailSent", "id", "notes", "paymentMethod", "paymentStatus", "shippingAddress", "shippingCharge", "subtotal", "total", "updatedAt") SELECT "createdAt", "currency", "customerId", "deliveryStatus", "emailSent", "id", "notes", "paymentMethod", "paymentStatus", "shippingAddress", "shippingCharge", "subtotal", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
