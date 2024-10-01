-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('INIT', 'CONFIRMING', 'IN_PROCESSING', 'REJECTED', 'DONE');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'INIT',
ADD COLUMN     "statusId" INTEGER;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
