/*
  Warnings:

  - Changed the type of `action` on the `AdminLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'START', 'RETURN', 'TERMINATE');

-- AlterTable
ALTER TABLE "AdminLog" DROP COLUMN "action",
ADD COLUMN     "action" "Action" NOT NULL;
