-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('bank', 'paypal', 'payoneer');

-- CreateTable
CREATE TABLE "PayoutDetail" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "paymentGateway" "PaymentGateway" NOT NULL,
    "mobileNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutDetail_accountId_key" ON "PayoutDetail"("accountId");

-- CreateIndex
CREATE INDEX "PayoutDetail_accountId_idx" ON "PayoutDetail"("accountId");

-- AddForeignKey
ALTER TABLE "PayoutDetail" ADD CONSTRAINT "PayoutDetail_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
