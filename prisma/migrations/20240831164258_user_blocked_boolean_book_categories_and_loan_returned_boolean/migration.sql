-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "categories" TEXT[];

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "returned" BOOLEAN NOT NULL DEFAULT false;
