/*
  Warnings:

  - Made the column `codmon` on table `GuiaRemisionCabecera` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ptopartida` on table `GuiaRemisionCabecera` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rucaux` on table `GuiaRemisionCabecera` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ubigeo1` on table `GuiaRemisionCabecera` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ubigeo2` on table `GuiaRemisionCabecera` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GuiaRemisionCabecera" ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'INGRESADO',
ALTER COLUMN "codmon" SET NOT NULL,
ALTER COLUMN "ptopartida" SET NOT NULL,
ALTER COLUMN "rucaux" SET NOT NULL,
ALTER COLUMN "ubigeo1" SET NOT NULL,
ALTER COLUMN "ubigeo2" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "GuiaRemisionDetalle" ADD CONSTRAINT "GuiaRemisionDetalle_id_ped_itmped_fkey" FOREIGN KEY ("id_ped", "itmped") REFERENCES "PedidoDetalle"("id_ped", "nroitm") ON DELETE RESTRICT ON UPDATE CASCADE;
