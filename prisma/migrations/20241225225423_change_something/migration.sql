/*
  Warnings:

  - Added the required column `owner` to the `issues_github` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "issues_github" ADD COLUMN     "owner" TEXT NOT NULL;
