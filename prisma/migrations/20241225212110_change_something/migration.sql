/*
  Warnings:

  - You are about to drop the column `userId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `github_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `github_name` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `github_org_url` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `github_url` on the `projects` table. All the data in the column will be lost.
  - Added the required column `project_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropIndex
DROP INDEX "projects_github_id_key";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "userId",
ADD COLUMN     "project_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "github_id",
DROP COLUMN "github_name",
DROP COLUMN "github_org_url",
DROP COLUMN "github_url";

-- CreateTable
CREATE TABLE "github_repo" (
    "id" SERIAL NOT NULL,
    "githubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "github_repo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "github_repo" ADD CONSTRAINT "github_repo_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_project_id_fkey" FOREIGN KEY ("user_id", "project_id") REFERENCES "project_members"("user_id", "project_id") ON DELETE CASCADE ON UPDATE CASCADE;
