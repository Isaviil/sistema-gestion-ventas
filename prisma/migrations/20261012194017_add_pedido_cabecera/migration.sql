-- CreateTable
CREATE TABLE "PedidoCabecera" (
    "id_ped" SERIAL NOT NULL,
    "nrodoc" TEXT NOT NULL,
    "ano" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "fchdoc" TIMESTAMP(3) NOT NULL,
    "fch_ing" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fch_ent" TIMESTAMP(3) NOT NULL,
    "id_clie" INTEGER NOT NULL,
    "id_ven" INTEGER NOT NULL,
    "for_pago" INTEGER NOT NULL,
    "usuario" INTEGER NOT NULL,
    "id_cot" INTEGER,
    "cotizacion" TEXT,
    "codmon" TEXT NOT NULL,
    "tpocmb" DECIMAL(10,4) NOT NULL,
    "nomaux" TEXT NOT NULL,
    "diraux" TEXT NOT NULL,
    "rucaux" TEXT NOT NULL,
    "ocompra" TEXT,
    "flg_incigv" BOOLEAN NOT NULL DEFAULT false,
    "porigv" DECIMAL(5,2) NOT NULL,
    "impbto" DECIMAL(12,2) NOT NULL,
    "impigv" DECIMAL(12,2) NOT NULL,
    "imptot" DECIMAL(12,2) NOT NULL,
    "glosa" TEXT,
    "factura" TEXT NOT NULL DEFAULT '',
    "guia_remision" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'INGRESADO',
    "flg_anu" BOOLEAN NOT NULL DEFAULT false,
    "flg_aprob" BOOLEAN NOT NULL DEFAULT false,
    "fch_anu" TIMESTAMP(3),
    "fch_aprob" TIMESTAMP(3),
    "fch_ate" TIMESTAMP(3),
    "usu_anu" INTEGER,
    "usu_aprob" INTEGER,
    "usu_cie" INTEGER,
    "usuario_anu" INTEGER,
    "usuario_aprob" INTEGER,
    "usuario_cie" INTEGER,

    CONSTRAINT "PedidoCabecera_pkey" PRIMARY KEY ("id_ped")
);

-- CreateIndex
CREATE UNIQUE INDEX "PedidoCabecera_nrodoc_key" ON "PedidoCabecera"("nrodoc");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_for_pago_fkey" FOREIGN KEY ("for_pago") REFERENCES "PaymentMethod"("for_pago") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCabecera" ADD CONSTRAINT "PedidoCabecera_id_clie_fkey" FOREIGN KEY ("id_clie") REFERENCES "Customer"("id_aux") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCabecera" ADD CONSTRAINT "PedidoCabecera_id_ven_fkey" FOREIGN KEY ("id_ven") REFERENCES "Vendor"("id_aux") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCabecera" ADD CONSTRAINT "PedidoCabecera_for_pago_fkey" FOREIGN KEY ("for_pago") REFERENCES "PaymentMethod"("for_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCabecera" ADD CONSTRAINT "PedidoCabecera_usuario_fkey" FOREIGN KEY ("usuario") REFERENCES "User"("id_usu") ON DELETE RESTRICT ON UPDATE CASCADE;
