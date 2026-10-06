/*
  Warnings:

  - You are about to drop the column `codmon` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `operador` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "codmon",
DROP COLUMN "operador";
