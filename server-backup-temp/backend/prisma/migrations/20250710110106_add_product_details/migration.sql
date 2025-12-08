/*
  Warnings:

  - You are about to drop the column `price` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "article" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Notification";
