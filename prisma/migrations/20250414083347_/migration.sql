/*
  Warnings:

  - Added the required column `slug` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "permanent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" VARCHAR(255) NOT NULL;
