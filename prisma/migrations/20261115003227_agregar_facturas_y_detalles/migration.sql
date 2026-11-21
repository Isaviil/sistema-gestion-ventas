-- AlterTable
ALTER TABLE "PedidoCabecera" ALTER COLUMN "factura" DROP NOT NULL,
ALTER COLUMN "factura" DROP DEFAULT;

-- CreateTable
CREATE TABLE "FacturacionCabecera" (
    "id_cpc" SERIAL NOT NULL,
    "ano" TEXT NOT NULL,
    "codalm" TEXT NOT NULL,
    "codmon" TEXT NOT NULL,
    "diavto" INTEGER NOT NULL,
    "diraux" TEXT NOT NULL,
    "fchcob" TIMESTAMP(3),
    "fchdoc" TIMESTAMP(3) NOT NULL,
    "fchvto" TIMESTAMP(3) NOT NULL,
    "fch_ing" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fch_anu" TIMESTAMP(3),
    "flg_incigv" BOOLEAN NOT NULL DEFAULT false,
    "flg_anu" BOOLEAN NOT NULL DEFAULT false,
    "for_pago" INTEGER,
    "id_aux" INTEGER,
    "id_ped" INTEGER,
    "id_tipdoc" INTEGER NOT NULL,
    "id_ven" INTEGER,
    "impadel" DECIMAL(12,2) NOT NULL,
    "impigv" DECIMAL(12,2) NOT NULL,
    "impsbt" DECIMAL(12,2) NOT NULL,
    "imptot" DECIMAL(12,2) NOT NULL,
    "monto_a" DECIMAL(12,2) NOT NULL,
    "monto_i" DECIMAL(12,2) NOT NULL,
    "sdodoc" DECIMAL(12,2) NOT NULL,
    "nomaux" TEXT NOT NULL,
    "nro_ped" TEXT,
    "nromes" TEXT NOT NULL,
    "num_doc" TEXT,
    "ocompra" TEXT,
    "porigv" DECIMAL(5,2) NOT NULL,
    "rucaux" TEXT NOT NULL,
    "ser_doc" TEXT NOT NULL,
    "tipo" TEXT,
    "tpocmb" DECIMAL(10,4) NOT NULL,
    "usuario" INTEGER,
    "usuario_anu" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'INGRESADO',

    CONSTRAINT "FacturacionCabecera_pkey" PRIMARY KEY ("id_cpc")
);

-- CreateTable
CREATE TABLE "FacturacionDetalle" (
    "id_cpc" INTEGER NOT NULL,
    "nroitm" INTEGER NOT NULL,
    "id_art" INTEGER NOT NULL,
    "cod_art" TEXT NOT NULL,
    "des_art" TEXT NOT NULL,
    "id_umedr" INTEGER NOT NULL,
    "factor" DECIMAL(12,4) NOT NULL,
    "can_art" INTEGER NOT NULL,
    "pre_art" DECIMAL(12,4) NOT NULL,
    "pdes_art" DECIMAL(5,2) NOT NULL,
    "pu_des" DECIMAL(12,4) NOT NULL,
    "tot_art" DECIMAL(12,2) NOT NULL,
    "des_ar1" TEXT,
    "des_ar2" TEXT,
    "des_ar3" TEXT,
    "des_ar4" TEXT,
    "des_ar5" TEXT,
    "des_ar6" TEXT,
    "des_ar7" TEXT,
    "des_ar8" TEXT,
    "subtot_art" DECIMAL(12,2) NOT NULL,
    "igv_art" DECIMAL(5,2) NOT NULL,
    "pu_conigv" DECIMAL(12,4) NOT NULL,
    "pu_sinigv" DECIMAL(12,4) NOT NULL,
    "operador" TEXT NOT NULL,
    "id_ped" INTEGER,
    "itmped" INTEGER,
    "nroped" TEXT,
    "id_alm" INTEGER,
    "itmalm" INTEGER,
    "nroalm" TEXT,

    CONSTRAINT "FacturacionDetalle_pkey" PRIMARY KEY ("id_cpc","nroitm")
);

-- CreateIndex
CREATE INDEX "FacturacionDetalle_id_ped_itmped_idx" ON "FacturacionDetalle"("id_ped", "itmped");

-- CreateIndex
CREATE INDEX "FacturacionDetalle_id_alm_itmalm_idx" ON "FacturacionDetalle"("id_alm", "itmalm");

-- AddForeignKey
ALTER TABLE "GuiaRemisionCabecera" ADD CONSTRAINT "GuiaRemisionCabecera_id_cpc_fkey" FOREIGN KEY ("id_cpc") REFERENCES "FacturacionCabecera"("id_cpc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionCabecera" ADD CONSTRAINT "FacturacionCabecera_id_aux_fkey" FOREIGN KEY ("id_aux") REFERENCES "Customer"("id_aux") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionCabecera" ADD CONSTRAINT "FacturacionCabecera_id_ven_fkey" FOREIGN KEY ("id_ven") REFERENCES "Vendor"("id_aux") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionCabecera" ADD CONSTRAINT "FacturacionCabecera_for_pago_fkey" FOREIGN KEY ("for_pago") REFERENCES "PaymentMethod"("for_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionCabecera" ADD CONSTRAINT "FacturacionCabecera_id_ped_fkey" FOREIGN KEY ("id_ped") REFERENCES "PedidoCabecera"("id_ped") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionCabecera" ADD CONSTRAINT "FacturacionCabecera_usuario_fkey" FOREIGN KEY ("usuario") REFERENCES "User"("id_usu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionCabecera" ADD CONSTRAINT "FacturacionCabecera_usuario_anu_fkey" FOREIGN KEY ("usuario_anu") REFERENCES "User"("id_usu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionDetalle" ADD CONSTRAINT "FacturacionDetalle_id_cpc_fkey" FOREIGN KEY ("id_cpc") REFERENCES "FacturacionCabecera"("id_cpc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionDetalle" ADD CONSTRAINT "FacturacionDetalle_id_art_fkey" FOREIGN KEY ("id_art") REFERENCES "Product"("id_art") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionDetalle" ADD CONSTRAINT "FacturacionDetalle_id_umedr_fkey" FOREIGN KEY ("id_umedr") REFERENCES "UnitOfMeasure"("id_umed") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionDetalle" ADD CONSTRAINT "FacturacionDetalle_id_ped_itmped_fkey" FOREIGN KEY ("id_ped", "itmped") REFERENCES "PedidoDetalle"("id_ped", "nroitm") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturacionDetalle" ADD CONSTRAINT "FacturacionDetalle_id_alm_itmalm_fkey" FOREIGN KEY ("id_alm", "itmalm") REFERENCES "GuiaRemisionDetalle"("id_remision", "nroitm") ON DELETE RESTRICT ON UPDATE CASCADE;
