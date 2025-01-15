/*
  Warnings:

  - Added the required column `bookTitle` to the `WaitList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `WaitList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WaitList" ADD COLUMN     "bookTitle" TEXT NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;
