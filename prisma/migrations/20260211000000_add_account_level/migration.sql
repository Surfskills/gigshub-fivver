-- CreateEnum
CREATE TYPE "AccountLevel" AS ENUM ('starter', 'level1', 'level2', 'proRated', 'fivverVetted');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN "accountLevel" "AccountLevel" NOT NULL DEFAULT 'starter';
