/*
  Warnings:

  - You are about to drop the column `returned` on the `Loan` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONGOING', 'RETURNED');

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "returned",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ONGOING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "AdminLogs" (
    "id" SERIAL NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminLogs" ADD CONSTRAINT "AdminLogs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
