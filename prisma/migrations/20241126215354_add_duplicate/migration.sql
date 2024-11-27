/*
  Warnings:

  - The values [COMPATIBILITY] on the enum `ReportIssueType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportIssueType_new" AS ENUM ('UI', 'FUNCTIONAL', 'PERFORMANCE', 'SECURITY', 'NETWORK', 'DATA', 'OTHER');
ALTER TABLE "reports" ALTER COLUMN "issue_type" TYPE "ReportIssueType_new" USING ("issue_type"::text::"ReportIssueType_new");
ALTER TYPE "ReportIssueType" RENAME TO "ReportIssueType_old";
ALTER TYPE "ReportIssueType_new" RENAME TO "ReportIssueType";
DROP TYPE "ReportIssueType_old";
COMMIT;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "duplicate_of_id" INTEGER;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_duplicate_of_id_fkey" FOREIGN KEY ("duplicate_of_id") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
