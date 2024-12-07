/*
  Warnings:

  - Added the required column `role_id` to the `invitation_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitation_tokens" ADD COLUMN     "role_id" INTEGER NOT NULL;
