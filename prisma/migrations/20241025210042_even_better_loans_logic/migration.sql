/*
  Warnings:

  - You are about to drop the `AdminLogs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminLogs" DROP CONSTRAINT "AdminLogs_adminId_fkey";

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "bookId" INTEGER,
ADD COLUMN     "expirationDate" TIMESTAMP(3),
ALTER COLUMN "loanDate" DROP NOT NULL,
ALTER COLUMN "returnDate" DROP NOT NULL;

-- DropTable
DROP TABLE "AdminLogs";

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" SERIAL NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
