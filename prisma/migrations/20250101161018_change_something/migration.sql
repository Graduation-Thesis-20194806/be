/*
  Warnings:

  - You are about to drop the column `isCloseStatus` on the `status` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskStatusCategory" AS ENUM ('OPEN', 'CLOSE', 'REOPEN', 'CUSTOM');

-- AlterTable
ALTER TABLE "status" DROP COLUMN "isCloseStatus",
ADD COLUMN     "category" "TaskStatusCategory" NOT NULL DEFAULT 'CUSTOM';
