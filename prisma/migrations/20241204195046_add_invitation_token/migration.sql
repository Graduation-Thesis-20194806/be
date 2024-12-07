/*
  Warnings:

  - The values [INVITATION] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('REFRESH', 'RECOVER');
ALTER TABLE "tokens" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "tokens" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
ALTER TABLE "tokens" ALTER COLUMN "type" SET DEFAULT 'REFRESH';
COMMIT;

-- CreateTable
CREATE TABLE "invitation_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokens_token_key" ON "invitation_tokens"("token");

-- CreateIndex
CREATE INDEX "invitation_tokens_user_id_project_id_idx" ON "invitation_tokens"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokens_user_id_project_id_key" ON "invitation_tokens"("user_id", "project_id");
