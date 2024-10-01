/*
  Warnings:

  - Added the required column `url` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "url" TEXT NOT NULL;
