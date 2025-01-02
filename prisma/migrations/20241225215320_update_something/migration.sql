/*
  Warnings:

  - Added the required column `number` to the `IssueGithub` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IssueGithub" ADD COLUMN     "number" INTEGER NOT NULL;
