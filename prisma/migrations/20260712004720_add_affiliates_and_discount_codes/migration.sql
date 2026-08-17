-- CreateTable
CREATE TABLE "Affiliate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerDiscountType" TEXT NOT NULL DEFAULT 'percent',
    "customerDiscountValue" REAL NOT NULL DEFAULT 0,
    "baseCommissionRate" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AffiliateTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliateId" TEXT NOT NULL,
    "minSales" REAL NOT NULL,
    "rate" REAL NOT NULL,
    CONSTRAINT "AffiliateTier_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "passwordHash" TEXT NOT NULL DEFAULT '',
    "acceptedDisclaimerAt" DATETIME,
    "onvoCustomerId" TEXT,
    "referredByAffiliateId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Customer_referredByAffiliateId_fkey" FOREIGN KEY ("referredByAffiliateId") REFERENCES "Affiliate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("acceptedDisclaimerAt", "address", "createdAt", "email", "firstName", "id", "lastName", "onvoCustomerId", "passwordHash", "phone", "updatedAt") SELECT "acceptedDisclaimerAt", "address", "createdAt", "email", "firstName", "id", "lastName", "onvoCustomerId", "passwordHash", "phone", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
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
    "payToken" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "affiliateId" TEXT,
    "discountCodeId" TEXT,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "promoCodeText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "currency", "customerId", "deliveryStatus", "emailSent", "id", "notes", "onvoPaymentIntentId", "payToken", "paymentMethod", "paymentStatus", "shippingAddress", "shippingCharge", "shippingCity", "shippingCountry", "shippingName", "shippingState", "shippingZip", "subtotal", "total", "updatedAt") SELECT "createdAt", "currency", "customerId", "deliveryStatus", "emailSent", "id", "notes", "onvoPaymentIntentId", "payToken", "paymentMethod", "paymentStatus", "shippingAddress", "shippingCharge", "shippingCity", "shippingCountry", "shippingName", "shippingState", "shippingZip", "subtotal", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_payToken_key" ON "Order"("payToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_email_key" ON "Affiliate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_code_key" ON "Affiliate"("code");

-- CreateIndex
CREATE INDEX "AffiliateTier_affiliateId_idx" ON "AffiliateTier"("affiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");
