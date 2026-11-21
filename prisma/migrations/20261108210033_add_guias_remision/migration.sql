/*
  Warnings:

  - You are about to alter the column `can_art` on the `PedidoDetalle` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "PedidoDetalle" ALTER COLUMN "can_art" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "GuiaRemisionCabecera" (
    "id_remision" SERIAL NOT NULL,
    "almdes" TEXT,
    "almori" TEXT,
    "ano" TEXT NOT NULL,
    "bultos" INTEGER NOT NULL,
    "codalm" TEXT NOT NULL,
    "codmon" TEXT,
    "codmov" TEXT NOT NULL,
    "dirent" TEXT,
    "factura" TEXT,
    "fchdoc" TIMESTAMP(3) NOT NULL,
    "fchtras" TIMESTAMP(3) NOT NULL,
    "fch_ing" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flg_incigv" BOOLEAN NOT NULL,
    "flg_anu" BOOLEAN NOT NULL DEFAULT false,
    "for_pago" INTEGER,
    "glosa" TEXT,
    "id_aux" INTEGER,
    "id_chof" INTEGER,
    "id_ped" INTEGER,
    "id_cpc" INTEGER,
    "id_transp" INTEGER,
    "id_vehi" INTEGER,
    "id_ven" INTEGER,
    "mes" TEXT NOT NULL,
    "nomaux" TEXT,
    "numero" TEXT,
    "peso" DECIMAL(12,2) NOT NULL,
    "porigv" DECIMAL(5,2) NOT NULL,
    "ptopartida" TEXT,
    "rucaux" TEXT,
    "serie" TEXT NOT NULL,
    "tpocmb" DECIMAL(10,4) NOT NULL,
    "ubigeo1" TEXT,
    "ubigeo2" TEXT,
    "usuario" INTEGER,
    "usuario_anu" INTEGER,

    CONSTRAINT "GuiaRemisionCabecera_pkey" PRIMARY KEY ("id_remision")
);

-- CreateTable
CREATE TABLE "GuiaRemisionDetalle" (
    "id_remision" INTEGER NOT NULL,
    "can_art" INTEGER NOT NULL,
    "cod_art" TEXT NOT NULL,
    "des_ar1" TEXT,
    "des_ar2" TEXT,
    "des_ar3" TEXT,
    "des_ar4" TEXT,
    "des_ar5" TEXT,
    "des_ar6" TEXT,
    "des_ar7" TEXT,
    "des_ar8" TEXT,
    "des_art" TEXT NOT NULL,
    "factor" DECIMAL(12,4) NOT NULL,
    "id_art" INTEGER NOT NULL,
    "id_cpc" INTEGER,
    "id_ped" INTEGER,
    "id_umedr" INTEGER NOT NULL,
    "igv_art" DECIMAL(5,2) NOT NULL,
    "itmcpc" INTEGER,
    "itmped" INTEGER,
    "nrocpc" TEXT,
    "nroitm" INTEGER NOT NULL,
    "nroped" TEXT,
    "operador" TEXT NOT NULL,
    "pdes_art" DECIMAL(5,2) NOT NULL,
    "pre_art" DECIMAL(12,4) NOT NULL,
    "pu_conigv" DECIMAL(12,4) NOT NULL,
    "pu_des" DECIMAL(12,4) NOT NULL,
    "pu_sinigv" DECIMAL(12,4) NOT NULL,
    "subtot_art" DECIMAL(12,2) NOT NULL,
    "tot_art" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "GuiaRemisionDetalle_pkey" PRIMARY KEY ("id_remision","nroitm")
);

-- AddForeignKey
ALTER TABLE "GuiaRemisionCabecera" ADD CONSTRAINT "GuiaRemisionCabecera_id_ped_fkey" FOREIGN KEY ("id_ped") REFERENCES "PedidoCabecera"("id_ped") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemisionCabecera" ADD CONSTRAINT "GuiaRemisionCabecera_id_aux_fkey" FOREIGN KEY ("id_aux") REFERENCES "Customer"("id_aux") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemisionCabecera" ADD CONSTRAINT "GuiaRemisionCabecera_id_ven_fkey" FOREIGN KEY ("id_ven") REFERENCES "Vendor"("id_aux") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemisionCabecera" ADD CONSTRAINT "GuiaRemisionCabecera_for_pago_fkey" FOREIGN KEY ("for_pago") REFERENCES "PaymentMethod"("for_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemisionCabecera" ADD CONSTRAINT "GuiaRemisionCabecera_usuario_fkey" FOREIGN KEY ("usuario") REFERENCES "User"("id_usu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemisionCabecera" ADD CONSTRAINT "GuiaRemisionCabecera_usuario_anu_fkey" FOREIGN KEY ("usuario_anu") REFERENCES "User"("id_usu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemisionDetalle" ADD CONSTRAINT "GuiaRemisionDetalle_id_remision_fkey" FOREIGN KEY ("id_remision") REFERENCES "GuiaRemisionCabecera"("id_remision") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemisionDetalle" ADD CONSTRAINT "GuiaRemisionDetalle_id_art_fkey" FOREIGN KEY ("id_art") REFERENCES "Product"("id_art") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemisionDetalle" ADD CONSTRAINT "GuiaRemisionDetalle_id_umedr_fkey" FOREIGN KEY ("id_umedr") REFERENCES "UnitOfMeasure"("id_umed") ON DELETE RESTRICT ON UPDATE CASCADE;
