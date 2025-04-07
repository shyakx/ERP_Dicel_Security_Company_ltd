/*
  Warnings:

  - You are about to drop the column `approvedBy` on the `Leave` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Leave" DROP COLUMN "approvedBy",
ADD COLUMN     "approvedById" TEXT;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
