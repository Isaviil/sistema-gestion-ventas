-- CreateTable
CREATE TABLE "PedidoDetalle" (
    "id_ped" INTEGER NOT NULL,
    "id_art" INTEGER NOT NULL,
    "id_umedr" INTEGER NOT NULL,
    "nroitm" INTEGER NOT NULL,
    "cod_art" TEXT NOT NULL,
    "des_art" TEXT NOT NULL,
    "des_ar1" TEXT,
    "des_ar2" TEXT,
    "des_ar3" TEXT,
    "des_ar4" TEXT,
    "des_ar5" TEXT,
    "des_ar6" TEXT,
    "des_ar7" TEXT,
    "des_ar8" TEXT,
    "can_art" DECIMAL(12,4) NOT NULL,
    "factor" DECIMAL(12,4) NOT NULL,
    "operador" TEXT NOT NULL,
    "alias_umed" TEXT NOT NULL,
    "pre_art" DECIMAL(12,4) NOT NULL,
    "pdes_art" DECIMAL(5,2) NOT NULL,
    "igv_art" DECIMAL(5,2) NOT NULL,
    "pu_conigv" DECIMAL(12,4) NOT NULL,
    "pu_sinigv" DECIMAL(12,4) NOT NULL,
    "pu_des" DECIMAL(12,4) NOT NULL,
    "subtot_art" DECIMAL(12,2) NOT NULL,
    "tot_art" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PedidoDetalle_pkey" PRIMARY KEY ("id_ped","nroitm")
);

-- AddForeignKey
ALTER TABLE "PedidoDetalle" ADD CONSTRAINT "PedidoDetalle_id_ped_fkey" FOREIGN KEY ("id_ped") REFERENCES "PedidoCabecera"("id_ped") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoDetalle" ADD CONSTRAINT "PedidoDetalle_id_umedr_fkey" FOREIGN KEY ("id_umedr") REFERENCES "UnitOfMeasure"("id_umed") ON DELETE RESTRICT ON UPDATE CASCADE;
