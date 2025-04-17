/*
  Warnings:

  - You are about to drop the column `created_at` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_id` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `UserOrganization` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `UserOrganization` table. All the data in the column will be lost.
  - Added the required column `transactionId` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `UserOrganization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `UserOrganization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserOrganization` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Approval_transaction_id_idx";

-- DropIndex
DROP INDEX "Category_organization_id_idx";

-- DropIndex
DROP INDEX "Role_organization_id_idx";

-- DropIndex
DROP INDEX "Transaction_category_id_idx";

-- DropIndex
DROP INDEX "Transaction_organization_id_idx";

-- DropIndex
DROP INDEX "UserOrganization_organization_id_idx";

-- DropIndex
DROP INDEX "UserOrganization_role_id_idx";

-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "transaction_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "transactionId" BIGINT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "organization_id",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "organizationId" BIGINT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "organization_id",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "organizationId" BIGINT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "category_id",
DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "organization_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "categoryId" BIGINT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "organizationId" BIGINT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserOrganization" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "organization_id",
DROP COLUMN "role_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "organizationId" BIGINT NOT NULL,
ADD COLUMN     "roleId" BIGINT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "Approval_transactionId_idx" ON "Approval"("transactionId");

-- CreateIndex
CREATE INDEX "Approval_userId_idx" ON "Approval"("userId");

-- CreateIndex
CREATE INDEX "Category_organizationId_idx" ON "Category"("organizationId");

-- CreateIndex
CREATE INDEX "Organization_userId_idx" ON "Organization"("userId");

-- CreateIndex
CREATE INDEX "Role_organizationId_idx" ON "Role"("organizationId");

-- CreateIndex
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");

-- CreateIndex
CREATE INDEX "Transaction_organizationId_idx" ON "Transaction"("organizationId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "UserOrganization_organizationId_idx" ON "UserOrganization"("organizationId");

-- CreateIndex
CREATE INDEX "UserOrganization_roleId_idx" ON "UserOrganization"("roleId");

-- CreateIndex
CREATE INDEX "UserOrganization_userId_idx" ON "UserOrganization"("userId");
