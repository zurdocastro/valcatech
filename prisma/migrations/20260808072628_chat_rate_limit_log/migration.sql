-- CreateTable
CREATE TABLE "ChatRequestLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ChatRequestLog_ip_createdAt_idx" ON "ChatRequestLog"("ip", "createdAt");
