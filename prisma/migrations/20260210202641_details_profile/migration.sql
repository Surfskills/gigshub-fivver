-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('fiverr', 'upwork', 'direct');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'paused', 'risk');

-- CreateEnum
CREATE TYPE "GigStatus" AS ENUM ('active', 'paused', 'deprecated');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('AM', 'PM');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'operator');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'operator',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "typeOfGigs" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "AccountStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gig" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rated" BOOLEAN NOT NULL DEFAULT false,
    "lastRatedDate" DATE,
    "nextPossibleRateDate" DATE,
    "status" "GigStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftReport" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "shift" "Shift" NOT NULL,
    "ordersCompleted" INTEGER NOT NULL DEFAULT 0,
    "pendingOrders" INTEGER NOT NULL DEFAULT 0,
    "availableBalance" DECIMAL(10,2) NOT NULL,
    "pendingBalance" DECIMAL(10,2) NOT NULL,
    "rankingPage" INTEGER,
    "notes" TEXT,
    "accountsCreated" JSONB,
    "rating" DECIMAL(3,2),
    "ordersInProgress" JSONB,
    "reportedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "Account_status_idx" ON "Account"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Account_platform_email_key" ON "Account"("platform", "email");

-- CreateIndex
CREATE INDEX "Gig_accountId_idx" ON "Gig"("accountId");

-- CreateIndex
CREATE INDEX "Gig_status_idx" ON "Gig"("status");

-- CreateIndex
CREATE INDEX "ShiftReport_reportDate_shift_idx" ON "ShiftReport"("reportDate", "shift");

-- CreateIndex
CREATE INDEX "ShiftReport_accountId_idx" ON "ShiftReport"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftReport_accountId_reportDate_shift_key" ON "ShiftReport"("accountId", "reportDate", "shift");

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftReport" ADD CONSTRAINT "ShiftReport_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftReport" ADD CONSTRAINT "ShiftReport_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
