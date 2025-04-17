-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" SMALLINT NOT NULL,
    "description" TEXT,
    "organization_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" BIGSERIAL NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "status" SMALLINT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "description" TEXT,
    "user_id" BIGINT NOT NULL,
    "attachments" TEXT[],
    "category_id" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "permanent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOrganization" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "avatar" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_organization_id_idx" ON "Category"("organization_id");

-- CreateIndex
CREATE INDEX "Approval_transaction_id_idx" ON "Approval"("transaction_id");

-- CreateIndex
CREATE INDEX "Transaction_category_id_idx" ON "Transaction"("category_id");

-- CreateIndex
CREATE INDEX "Transaction_organization_id_idx" ON "Transaction"("organization_id");

-- CreateIndex
CREATE INDEX "Role_organization_id_idx" ON "Role"("organization_id");

-- CreateIndex
CREATE INDEX "UserOrganization_organization_id_idx" ON "UserOrganization"("organization_id");

-- CreateIndex
CREATE INDEX "UserOrganization_role_id_idx" ON "UserOrganization"("role_id");
