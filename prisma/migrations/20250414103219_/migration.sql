/*
  Warnings:

  - You are about to alter the column `name` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `description` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rolePermissionId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "description" VARCHAR(255) NOT NULL,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rolePermissionId" BIGINT NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" BIGSERIAL NOT NULL,
    "role_id" BIGINT NOT NULL,
    "permission" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RolePermission_role_id_idx" ON "RolePermission"("role_id");
