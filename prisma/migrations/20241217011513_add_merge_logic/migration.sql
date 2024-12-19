-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
