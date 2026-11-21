/*
  Warnings:

  - Made the column `numero` on table `GuiaRemisionCabecera` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GuiaRemisionCabecera" ADD COLUMN     "fch_anu" TIMESTAMP(3),
ALTER COLUMN "numero" SET NOT NULL;
