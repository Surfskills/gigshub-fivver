-- AlterTable
ALTER TABLE "ShiftReport" ADD COLUMN     "handedOverToUserId" TEXT,
ADD COLUMN     "successRate" DECIMAL(5,2);

-- AddForeignKey
ALTER TABLE "ShiftReport" ADD CONSTRAINT "ShiftReport_handedOverToUserId_fkey" FOREIGN KEY ("handedOverToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
