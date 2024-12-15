-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "phaseId" INTEGER;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "phaseId" INTEGER;

-- CreateTable
CREATE TABLE "phases" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_assign" (
    "id" SERIAL NOT NULL,
    "issue_type" "ReportIssueType",
    "assigned_to" INTEGER,

    CONSTRAINT "auto_assign_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "phases" ADD CONSTRAINT "phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_assign" ADD CONSTRAINT "auto_assign_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "project_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
