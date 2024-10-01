-- CreateEnum
CREATE TYPE "ReportIssueType" AS ENUM ('UI', 'FUNCTIONAL', 'PERFORMANCE', 'SECURITY', 'NETWORK', 'COMPATIBILITY', 'DATA');

-- AlterEnum
ALTER TYPE "ReportType" ADD VALUE 'WISH';

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "actual_result" TEXT,
ADD COLUMN     "expected_behavior" TEXT,
ADD COLUMN     "issue_type" "ReportIssueType",
ADD COLUMN     "steps_to_reproduce" TEXT;
