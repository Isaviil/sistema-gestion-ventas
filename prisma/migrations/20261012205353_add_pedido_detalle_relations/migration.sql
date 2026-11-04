/*
  Warnings:

  - You are about to drop the column `usu_anu` on the `PedidoCabecera` table. All the data in the column will be lost.
  - You are about to drop the column `usu_aprob` on the `PedidoCabecera` table. All the data in the column will be lost.
  - You are about to drop the column `usu_cie` on the `PedidoCabecera` table. All the data in the column will be lost.
  - The `estado` column on the `PedidoCabecera` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('INGRESADO', 'APROBADO', 'PARCIAL', 'ATENDIDO', 'ANULADO');

-- AlterTable
ALTER TABLE "PedidoCabecera" DROP COLUMN "usu_anu",
DROP COLUMN "usu_aprob",
DROP COLUMN "usu_cie",
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoPedido" NOT NULL DEFAULT 'INGRESADO';

-- AddForeignKey
ALTER TABLE "PedidoCabecera" ADD CONSTRAINT "PedidoCabecera_usuario_anu_fkey" FOREIGN KEY ("usuario_anu") REFERENCES "User"("id_usu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCabecera" ADD CONSTRAINT "PedidoCabecera_usuario_aprob_fkey" FOREIGN KEY ("usuario_aprob") REFERENCES "User"("id_usu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCabecera" ADD CONSTRAINT "PedidoCabecera_usuario_cie_fkey" FOREIGN KEY ("usuario_cie") REFERENCES "User"("id_usu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoDetalle" ADD CONSTRAINT "PedidoDetalle_id_art_fkey" FOREIGN KEY ("id_art") REFERENCES "Product"("id_art") ON DELETE RESTRICT ON UPDATE CASCADE;
