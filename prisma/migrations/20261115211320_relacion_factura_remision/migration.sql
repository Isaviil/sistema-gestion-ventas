/*
  Warnings:

  - You are about to drop the column `factura` on the `GuiaRemisionCabecera` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_remision]` on the table `FacturacionCabecera` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "GuiaRemisionCabecera" DROP CONSTRAINT "GuiaRemisionCabecera_id_cpc_fkey";

-- AlterTable
ALTER TABLE "FacturacionCabecera" ADD COLUMN     "id_remision" INTEGER;

-- AlterTable
ALTER TABLE "GuiaRemisionCabecera" DROP COLUMN "factura";

-- CreateTable
CREATE TABLE "_RemisionFacturaCabecera" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RemisionFacturaCabecera_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RemisionFacturaCabecera_B_index" ON "_RemisionFacturaCabecera"("B");

-- CreateIndex
CREATE UNIQUE INDEX "FacturacionCabecera_id_remision_key" ON "FacturacionCabecera"("id_remision");

-- AddForeignKey
ALTER TABLE "FacturacionCabecera" ADD CONSTRAINT "FacturacionCabecera_id_remision_fkey" FOREIGN KEY ("id_remision") REFERENCES "GuiaRemisionCabecera"("id_remision") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RemisionFacturaCabecera" ADD CONSTRAINT "_RemisionFacturaCabecera_A_fkey" FOREIGN KEY ("A") REFERENCES "FacturacionCabecera"("id_cpc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RemisionFacturaCabecera" ADD CONSTRAINT "_RemisionFacturaCabecera_B_fkey" FOREIGN KEY ("B") REFERENCES "GuiaRemisionCabecera"("id_remision") ON DELETE CASCADE ON UPDATE CASCADE;
