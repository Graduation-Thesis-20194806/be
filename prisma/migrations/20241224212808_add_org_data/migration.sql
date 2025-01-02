/*
  Warnings:

  - The `github_id` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "github_org_id" INTEGER,
ADD COLUMN     "github_org_name" TEXT,
ADD COLUMN     "github_org_url" TEXT,
DROP COLUMN "github_id",
ADD COLUMN     "github_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "projects_github_id_key" ON "projects"("github_id");
