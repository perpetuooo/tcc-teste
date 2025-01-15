/*
  Warnings:

  - You are about to drop the column `bookId` on the `Loan` table. All the data in the column will be lost.
  - Added the required column `ISBN` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('GOOD', 'BAD');

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'REQUESTED';

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_bookId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_userId_fkey";

-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "copies" SET DEFAULT 0,
ALTER COLUMN "copiesAvailable" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "bookId",
ADD COLUMN     "ISBN" TEXT NOT NULL,
ADD COLUMN     "copyId" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Copy" (
    "id" SERIAL NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "ISBN" TEXT NOT NULL,
    "condition" "Condition" NOT NULL,
    "isLoaned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Copy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Copy_ISBN_key" ON "Copy"("ISBN");

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_bookTitle_fkey" FOREIGN KEY ("bookTitle") REFERENCES "Book"("title") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "Copy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
