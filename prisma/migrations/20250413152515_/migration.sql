-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "balance" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
ADD COLUMN     "year_start" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;
