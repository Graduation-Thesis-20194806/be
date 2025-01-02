/*
  Warnings:

  - A unique constraint covering the columns `[github_id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[github_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('GITHUB', 'DEFAULT');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "github_id" INTEGER,
ADD COLUMN     "github_name" TEXT,
ADD COLUMN     "github_url" TEXT;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "github_access_token" TEXT,
ADD COLUMN     "github_id" TEXT,
ADD COLUMN     "github_username" TEXT;

-- CreateTable
CREATE TABLE "IssueGithub" (
    "taskId" INTEGER NOT NULL,
    "github_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "IssueGithub_taskId_key" ON "IssueGithub"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "IssueGithub_github_id_key" ON "IssueGithub"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_github_id_key" ON "projects"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_github_id_key" ON "users"("github_id");

-- AddForeignKey
ALTER TABLE "IssueGithub" ADD CONSTRAINT "IssueGithub_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
