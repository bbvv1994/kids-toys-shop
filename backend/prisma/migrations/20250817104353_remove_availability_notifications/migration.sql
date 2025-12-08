/*
  Warnings:

  - You are about to drop the `AvailabilityNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AvailabilityNotification" DROP CONSTRAINT "AvailabilityNotification_productId_fkey";

-- DropTable
DROP TABLE "public"."AvailabilityNotification";
