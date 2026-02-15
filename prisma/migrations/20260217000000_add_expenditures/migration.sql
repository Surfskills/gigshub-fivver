-- CreateEnum
CREATE TYPE "ExpenditureType" AS ENUM ('internet', 'rent', 'proxy', 'electricity', 'water', 'meals', 'office_furniture', 'electronics');

-- CreateTable
CREATE TABLE "Expenditure" (
    "id" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "typeOfExpenditure" "ExpenditureType" NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expenditure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expenditure_typeOfExpenditure_idx" ON "Expenditure"("typeOfExpenditure");

-- CreateIndex
CREATE INDEX "Expenditure_createdAt_idx" ON "Expenditure"("createdAt");
