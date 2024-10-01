/*
  Warnings:

  - Added the required column `reportId` to the `report_comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "report_comments" ADD COLUMN     "reportId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
