/*
  Warnings:

  - You are about to drop the column `owner_id` on the `projects` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ProjectRole" ADD VALUE 'OWNER';

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_id_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "owner_id";
