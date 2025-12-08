/*
  Warnings:

  - You are about to drop the column `descriptionEn` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `nameEn` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "descriptionEn",
DROP COLUMN "nameEn";
