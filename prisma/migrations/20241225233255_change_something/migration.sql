/*
  Warnings:

  - You are about to drop the column `owner` on the `issues_github` table. All the data in the column will be lost.
  - Added the required column `owner` to the `github_repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "github_repo" ADD COLUMN     "owner" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "issues_github" DROP COLUMN "owner";
