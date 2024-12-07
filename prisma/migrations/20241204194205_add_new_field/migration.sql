-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('REFRESH', 'RECOVER', 'INVITATION');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "is_processing" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "type" "TokenType" NOT NULL DEFAULT 'REFRESH';
