-- CreateTable
CREATE TABLE "WhatsAppContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "customerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WhatsAppContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contactId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "waMessageId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "WhatsAppContact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "payToken" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'site',
    "reviewStatus" TEXT NOT NULL DEFAULT 'approved',
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
INSERT INTO "new_Order" ("affiliateId", "createdAt", "currency", "customerId", "deliveryStatus", "discountAmount", "discountCodeId", "emailSent", "id", "notes", "onvoPaymentIntentId", "payToken", "paymentMethod", "paymentStatus", "promoCodeText", "shippingAddress", "shippingCharge", "shippingCity", "shippingCountry", "shippingName", "shippingState", "shippingZip", "subtotal", "total", "updatedAt") SELECT "affiliateId", "createdAt", "currency", "customerId", "deliveryStatus", "discountAmount", "discountCodeId", "emailSent", "id", "notes", "onvoPaymentIntentId", "payToken", "paymentMethod", "paymentStatus", "promoCodeText", "shippingAddress", "shippingCharge", "shippingCity", "shippingCountry", "shippingName", "shippingState", "shippingZip", "subtotal", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_payToken_key" ON "Order"("payToken");
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "shippingFee" REAL NOT NULL DEFAULT 25,
    "pagoTarjeta" BOOLEAN NOT NULL DEFAULT true,
    "whatsappAgentInfo" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("id", "pagoTarjeta", "shippingFee", "updatedAt") SELECT "id", "pagoTarjeta", "shippingFee", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppContact_phone_key" ON "WhatsAppContact"("phone");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_contactId_idx" ON "WhatsAppMessage"("contactId");
