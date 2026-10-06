-- CreateTable
CREATE TABLE "Vendor" (
    "id_aux" SERIAL NOT NULL,
    "cod_ven" TEXT NOT NULL,
    "nom_aux" TEXT NOT NULL,
    "ape_aux" TEXT NOT NULL,
    "ape_mat" TEXT NOT NULL,
    "tdoc_ide" TEXT NOT NULL,
    "ndoc_ide" TEXT NOT NULL,
    "cel_job" TEXT NOT NULL,
    "email_job" TEXT NOT NULL,
    "fec_reg" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flg_baja" BOOLEAN NOT NULL DEFAULT false,
    "flg_tda" BOOLEAN NOT NULL DEFAULT false,
    "basico" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "id_area" INTEGER NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id_aux")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_cod_ven_key" ON "Vendor"("cod_ven");
