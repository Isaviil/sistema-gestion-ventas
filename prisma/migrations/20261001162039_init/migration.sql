-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id_usu" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom_usu" TEXT NOT NULL,
    "rol" "Role" NOT NULL DEFAULT 'USER',
    "flg_activo" BOOLEAN NOT NULL DEFAULT true,
    "fec_reg" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_usu")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "for_pago" SERIAL NOT NULL,
    "forma_pago" TEXT NOT NULL,
    "codigo" TEXT,
    "dias" INTEGER NOT NULL DEFAULT 0,
    "flg_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("for_pago")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id_aux" SERIAL NOT NULL,
    "cod_ven" TEXT NOT NULL,
    "nom_aux" TEXT NOT NULL,
    "ape_aux" TEXT NOT NULL,
    "ape_mat" TEXT,
    "tdoc_ide" TEXT,
    "ndoc_ide" TEXT,
    "cel_job" TEXT,
    "email_job" TEXT,
    "flg_baja" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id_aux")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id_aux" SERIAL NOT NULL,
    "des_aux" TEXT NOT NULL,
    "tipo_pers" INTEGER,
    "tdoc_ide" TEXT,
    "ruc_aux" TEXT,
    "dir_legal" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "web" TEXT,
    "ubigeo" TEXT,
    "departamento" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "id_ven" INTEGER,
    "for_pago" INTEGER,
    "id_tpoclie" INTEGER,
    "fec_reg" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flg_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id_aux")
);

-- CreateTable
CREATE TABLE "Product" (
    "id_art" SERIAL NOT NULL,
    "cod_art" TEXT NOT NULL,
    "des_art" TEXT NOT NULL,
    "stkact" INTEGER NOT NULL DEFAULT 0,
    "codmon" TEXT NOT NULL,
    "pre_art" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pv2" DECIMAL(65,30) DEFAULT 0,
    "pv3" DECIMAL(65,30) DEFAULT 0,
    "pv4" DECIMAL(65,30) DEFAULT 0,
    "id_umedr" INTEGER,
    "alias_umed" TEXT,
    "cod_grupo" TEXT,
    "operador" TEXT,
    "flg_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id_art")
);

-- CreateTable
CREATE TABLE "Currency" (
    "codmon" TEXT NOT NULL,
    "descrip" TEXT NOT NULL,
    "flg_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("codmon")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id_tcmb" TEXT NOT NULL,
    "fchcmb" TIMESTAMP(3) NOT NULL,
    "oficmp" DECIMAL(65,30) NOT NULL,
    "ofivta" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id_tcmb")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id_tipdoc" SERIAL NOT NULL,
    "flg_sunat" BOOLEAN NOT NULL DEFAULT false,
    "codsunat" TEXT,
    "dcor_tdoc" TEXT NOT NULL,
    "dlar_tdoc" TEXT NOT NULL,
    "flg_vta" BOOLEAN NOT NULL DEFAULT false,
    "flg_alm" BOOLEAN NOT NULL DEFAULT false,
    "flg_provi" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id_tipdoc")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_codigo_key" ON "PaymentMethod"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_cod_ven_key" ON "Seller"("cod_ven");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_ndoc_ide_key" ON "Seller"("ndoc_ide");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_ruc_aux_key" ON "Customer"("ruc_aux");

-- CreateIndex
CREATE UNIQUE INDEX "Product_cod_art_key" ON "Product"("cod_art");
