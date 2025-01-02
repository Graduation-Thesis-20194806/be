/*
  Warnings:

  - Changed the type of `content` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "is_seen" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
