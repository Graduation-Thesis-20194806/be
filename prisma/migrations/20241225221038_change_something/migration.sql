/*
  Warnings:

  - You are about to drop the `IssueGithub` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "IssueGithub" DROP CONSTRAINT "IssueGithub_taskId_fkey";

-- DropTable
DROP TABLE "IssueGithub";

-- CreateTable
CREATE TABLE "issues_github" (
    "task_id" INTEGER NOT NULL,
    "repo_id" INTEGER NOT NULL,
    "github_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "number" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "issues_github_task_id_key" ON "issues_github"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "issues_github_github_id_key" ON "issues_github"("github_id");

-- AddForeignKey
ALTER TABLE "issues_github" ADD CONSTRAINT "issues_github_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues_github" ADD CONSTRAINT "issues_github_repo_id_fkey" FOREIGN KEY ("repo_id") REFERENCES "github_repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
