/*
  Warnings:

  - You are about to drop the column `duplicate_of_id` on the `reports` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_duplicate_of_id_fkey";

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "duplicate_of_id",
ADD COLUMN     "groupId" INTEGER;

-- CreateTable
CREATE TABLE "DuplicateGroup" (
    "id" SERIAL NOT NULL,
    "description" TEXT,

    CONSTRAINT "DuplicateGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DuplicateGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
