/*
  Warnings:

  - The primary key for the `Loan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Loan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[title]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `copiesAvailable` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "copiesAvailable" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Loan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Book_title_key" ON "Book"("title");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
