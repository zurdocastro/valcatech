-- CreateTable
CREATE TABLE "ShipmentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "eventCode" TEXT NOT NULL,
    "eventDescription" TEXT NOT NULL,
    "eventCreateTime" DATETIME NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "stateOrProvinceCode" TEXT NOT NULL DEFAULT '',
    "countryCode" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShipmentEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "trackingNumber" TEXT,
    "carrier" TEXT NOT NULL DEFAULT '',
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
INSERT INTO "new_Order" ("affiliateId", "createdAt", "currency", "customerId", "deliveryStatus", "discountAmount", "discountCodeId", "emailSent", "id", "notes", "onvoPaymentIntentId", "payToken", "paymentMethod", "paymentStatus", "promoCodeText", "reviewStatus", "shippingAddress", "shippingCharge", "shippingCity", "shippingCountry", "shippingName", "shippingState", "shippingZip", "source", "subtotal", "total", "updatedAt") SELECT "affiliateId", "createdAt", "currency", "customerId", "deliveryStatus", "discountAmount", "discountCodeId", "emailSent", "id", "notes", "onvoPaymentIntentId", "payToken", "paymentMethod", "paymentStatus", "promoCodeText", "reviewStatus", "shippingAddress", "shippingCharge", "shippingCity", "shippingCountry", "shippingName", "shippingState", "shippingZip", "source", "subtotal", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_payToken_key" ON "Order"("payToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ShipmentEvent_orderId_idx" ON "ShipmentEvent"("orderId");
