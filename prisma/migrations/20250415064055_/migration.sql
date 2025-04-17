/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `Approval` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Approval_transaction_id_key" ON "Approval"("transaction_id");
