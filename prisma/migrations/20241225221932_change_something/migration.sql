/*
  Warnings:

  - You are about to drop the column `githubId` on the `github_repo` table. All the data in the column will be lost.
  - Added the required column `github_id` to the `github_repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "github_repo" DROP COLUMN "githubId",
ADD COLUMN     "github_id" INTEGER NOT NULL,
ADD COLUMN     "hook_id" INTEGER;
