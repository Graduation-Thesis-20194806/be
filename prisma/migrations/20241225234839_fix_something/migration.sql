/*
  Warnings:

  - You are about to drop the column `github_id` on the `issues_github` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "issues_github_github_id_key";

-- AlterTable
ALTER TABLE "github_repo" ALTER COLUMN "github_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "issues_github" DROP COLUMN "github_id";
