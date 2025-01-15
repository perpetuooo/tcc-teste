/*
  Warnings:

  - You are about to drop the `_BookToCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BookToCategory" DROP CONSTRAINT "_BookToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookToCategory" DROP CONSTRAINT "_BookToCategory_B_fkey";

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "categoryId" INTEGER;

-- DropTable
DROP TABLE "_BookToCategory";

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
