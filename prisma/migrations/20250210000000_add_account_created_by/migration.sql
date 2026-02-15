-- AlterTable (idempotent - column may already exist from prior partial apply)
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "Account_createdByUserId_idx" ON "Account"("createdByUserId");

-- AddForeignKey (idempotent - skip if constraint exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Account_createdByUserId_fkey'
  ) THEN
    ALTER TABLE "Account" ADD CONSTRAINT "Account_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
