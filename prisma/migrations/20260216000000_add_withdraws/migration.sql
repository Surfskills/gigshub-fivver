-- CreateTable
CREATE TABLE "Withdraw" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "withdrawDate" DATE NOT NULL,
    "paymentMeans" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Withdraw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Withdraw_accountId_idx" ON "Withdraw"("accountId");

-- CreateIndex
CREATE INDEX "Withdraw_withdrawDate_idx" ON "Withdraw"("withdrawDate");

-- AddForeignKey
ALTER TABLE "Withdraw" ADD CONSTRAINT "Withdraw_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
