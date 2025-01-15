/*
  Warnings:

  - Added the required column `bookTitle` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "bookTitle" TEXT NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT true;
