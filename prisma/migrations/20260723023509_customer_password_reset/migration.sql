-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Customer" ADD COLUMN "resetTokenExpiresAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_resetToken_key" ON "Customer"("resetToken");
