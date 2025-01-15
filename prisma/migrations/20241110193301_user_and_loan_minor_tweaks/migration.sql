/*
  Warnings:

  - You are about to drop the column `isBanned` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isBanned",
ALTER COLUMN "isBlocked" SET DEFAULT false;
