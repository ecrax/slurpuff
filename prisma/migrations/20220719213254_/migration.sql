/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "timeRequired" DROP DEFAULT;

-- DropTable
DROP TABLE "VerificationToken";
