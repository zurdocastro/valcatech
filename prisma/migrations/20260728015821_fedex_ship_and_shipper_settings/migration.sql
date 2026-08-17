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
    "trackingNumber" TEXT,
    "carrier" TEXT NOT NULL DEFAULT '',
    "labelUrl" TEXT NOT NULL DEFAULT '',
    "podDeliveredAt" DATETIME,
    "podSignee" TEXT NOT NULL DEFAULT '',
    "podGpsCoordinates" TEXT NOT NULL DEFAULT '',
    "podImageUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("affiliateId", "carrier", "createdAt", "currency", "customerId", "deliveryStatus", "discountAmount", "discountCodeId", "emailSent", "id", "notes", "onvoPaymentIntentId", "payToken", "paymentMethod", "paymentStatus", "podDeliveredAt", "podGpsCoordinates", "podImageUrl", "podSignee", "promoCodeText", "reviewStatus", "shippingAddress", "shippingCharge", "shippingCity", "shippingCountry", "shippingName", "shippingState", "shippingZip", "source", "subtotal", "total", "trackingNumber", "updatedAt") SELECT "affiliateId", "carrier", "createdAt", "currency", "customerId", "deliveryStatus", "discountAmount", "discountCodeId", "emailSent", "id", "notes", "onvoPaymentIntentId", "payToken", "paymentMethod", "paymentStatus", "podDeliveredAt", "podGpsCoordinates", "podImageUrl", "podSignee", "promoCodeText", "reviewStatus", "shippingAddress", "shippingCharge", "shippingCity", "shippingCountry", "shippingName", "shippingState", "shippingZip", "source", "subtotal", "total", "trackingNumber", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_payToken_key" ON "Order"("payToken");
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "shippingFee" REAL NOT NULL DEFAULT 25,
    "pagoTarjeta" BOOLEAN NOT NULL DEFAULT true,
    "agentInfo" TEXT NOT NULL DEFAULT '',
    "shipperName" TEXT NOT NULL DEFAULT '',
    "shipperCompany" TEXT NOT NULL DEFAULT '',
    "shipperPhone" TEXT NOT NULL DEFAULT '',
    "shipperStreet" TEXT NOT NULL DEFAULT '',
    "shipperCity" TEXT NOT NULL DEFAULT '',
    "shipperState" TEXT NOT NULL DEFAULT '',
    "shipperZip" TEXT NOT NULL DEFAULT '',
    "shipperCountry" TEXT NOT NULL DEFAULT 'US',
    "defaultPackageWeightLb" REAL NOT NULL DEFAULT 1,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("agentInfo", "id", "pagoTarjeta", "shippingFee", "updatedAt") SELECT "agentInfo", "id", "pagoTarjeta", "shippingFee", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
