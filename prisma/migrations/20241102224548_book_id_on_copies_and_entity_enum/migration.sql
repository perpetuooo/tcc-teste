/*
  Warnings:

  - Changed the type of `entityType` on the `AdminLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `bookId` to the `Copy` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('USER', 'BOOK', 'CATEGORY', 'COPY', 'LOAN');

-- DropForeignKey
ALTER TABLE "AdminLog" DROP CONSTRAINT "AdminLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Copy" DROP CONSTRAINT "Copy_bookTitle_fkey";

-- AlterTable
ALTER TABLE "AdminLog" ALTER COLUMN "adminId" DROP NOT NULL,
DROP COLUMN "entityType",
ADD COLUMN     "entityType" "Entity" NOT NULL;

-- AlterTable
ALTER TABLE "Copy" ADD COLUMN     "bookId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
