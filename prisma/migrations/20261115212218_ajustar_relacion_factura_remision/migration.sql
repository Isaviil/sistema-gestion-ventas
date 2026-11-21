/*
  Warnings:

  - You are about to drop the `_RemisionFacturaCabecera` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RemisionFacturaCabecera" DROP CONSTRAINT "_RemisionFacturaCabecera_A_fkey";

-- DropForeignKey
ALTER TABLE "_RemisionFacturaCabecera" DROP CONSTRAINT "_RemisionFacturaCabecera_B_fkey";

-- DropTable
DROP TABLE "_RemisionFacturaCabecera";

-- AddForeignKey
ALTER TABLE "GuiaRemisionCabecera" ADD CONSTRAINT "GuiaRemisionCabecera_id_cpc_fkey" FOREIGN KEY ("id_cpc") REFERENCES "FacturacionCabecera"("id_cpc") ON DELETE RESTRICT ON UPDATE CASCADE;
