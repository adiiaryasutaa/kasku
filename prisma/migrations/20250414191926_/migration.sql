/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "balance" DROP NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "year_start" DROP NOT NULL,
ALTER COLUMN "permanent" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "permanent" DROP NOT NULL,
ALTER COLUMN "isDefault" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";
