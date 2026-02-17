-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('client', 'paypal', 'cash');

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN "ratingType" "RatingType",
ADD COLUMN "ratingEmail" VARCHAR(255);
