/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserOrganization` table. All the data in the column will be lost.
  - Added the required column `transaction_id` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `UserOrganization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `UserOrganization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserOrganization` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Approval_transactionId_idx";

-- DropIndex
DROP INDEX "Approval_userId_idx";

-- DropIndex
DROP INDEX "Category_organizationId_idx";

-- DropIndex
DROP INDEX "Organization_userId_idx";

-- DropIndex
DROP INDEX "Role_organizationId_idx";

-- DropIndex
DROP INDEX "Transaction_categoryId_idx";

-- DropIndex
DROP INDEX "Transaction_organizationId_idx";

-- DropIndex
DROP INDEX "Transaction_userId_idx";

-- DropIndex
DROP INDEX "UserOrganization_organizationId_idx";

-- DropIndex
DROP INDEX "UserOrganization_roleId_idx";

-- DropIndex
DROP INDEX "UserOrganization_userId_idx";

-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "transactionId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "transaction_id" BIGINT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "organizationId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" BIGINT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "organizationId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" BIGINT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "categoryId",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "organizationId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "category_id" BIGINT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" BIGINT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserOrganization" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "organizationId",
DROP COLUMN "roleId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" BIGINT NOT NULL,
ADD COLUMN     "role_id" BIGINT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "Approval_transaction_id_idx" ON "Approval"("transaction_id");

-- CreateIndex
CREATE INDEX "Approval_user_id_idx" ON "Approval"("user_id");

-- CreateIndex
CREATE INDEX "Category_organization_id_idx" ON "Category"("organization_id");

-- CreateIndex
CREATE INDEX "Organization_user_id_idx" ON "Organization"("user_id");

-- CreateIndex
CREATE INDEX "Role_organization_id_idx" ON "Role"("organization_id");

-- CreateIndex
CREATE INDEX "Transaction_category_id_idx" ON "Transaction"("category_id");

-- CreateIndex
CREATE INDEX "Transaction_organization_id_idx" ON "Transaction"("organization_id");

-- CreateIndex
CREATE INDEX "Transaction_user_id_idx" ON "Transaction"("user_id");

-- CreateIndex
CREATE INDEX "UserOrganization_organization_id_idx" ON "UserOrganization"("organization_id");

-- CreateIndex
CREATE INDEX "UserOrganization_role_id_idx" ON "UserOrganization"("role_id");

-- CreateIndex
CREATE INDEX "UserOrganization_user_id_idx" ON "UserOrganization"("user_id");
