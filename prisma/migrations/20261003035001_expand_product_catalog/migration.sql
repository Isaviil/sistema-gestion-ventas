/*
  Warnings:

  - You are about to drop the column `alias_umed` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `cod_grupo` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "alias_umed",
DROP COLUMN "cod_grupo",
ADD COLUMN     "des_art2" TEXT,
ADD COLUMN     "id_color" INTEGER,
ADD COLUMN     "id_corte" INTEGER,
ADD COLUMN     "id_fam" INTEGER,
ADD COLUMN     "id_mar" INTEGER,
ADD COLUMN     "id_talla" INTEGER,
ADD COLUMN     "peso" DECIMAL(65,30) DEFAULT 0;

-- CreateTable
CREATE TABLE "ProductFamily" (
    "id_fam" INTEGER NOT NULL,
    "familia" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,

    CONSTRAINT "ProductFamily_pkey" PRIMARY KEY ("id_fam")
);

-- CreateTable
CREATE TABLE "ProductCut" (
    "id_corte" INTEGER NOT NULL,
    "corte" TEXT NOT NULL,

    CONSTRAINT "ProductCut_pkey" PRIMARY KEY ("id_corte")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id_mar" INTEGER NOT NULL,
    "marca" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id_mar")
);

-- CreateTable
CREATE TABLE "ProductColor" (
    "id_color" INTEGER NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("id_color")
);

-- CreateTable
CREATE TABLE "ProductSize" (
    "id_talla" INTEGER NOT NULL,
    "talla" TEXT NOT NULL,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id_talla")
);
