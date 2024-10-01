/*
  Warnings:

  - You are about to drop the column `ownerId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `projectThumbnail` on the `projects` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_ownerId_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "ownerId",
DROP COLUMN "projectThumbnail",
ADD COLUMN     "owner_id" INTEGER NOT NULL,
ADD COLUMN     "project_thumbnail" TEXT;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
