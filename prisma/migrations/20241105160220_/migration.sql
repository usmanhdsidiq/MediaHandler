/*
  Warnings:

  - Made the column `imageKitFileId` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "imageKitFileId" SET NOT NULL;
