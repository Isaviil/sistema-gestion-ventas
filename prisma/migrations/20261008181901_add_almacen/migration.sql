-- CreateTable
CREATE TABLE "Almacen" (
    "codalm" TEXT NOT NULL,
    "aliasalm" TEXT NOT NULL,
    "desalm" TEXT NOT NULL,
    "diralm" TEXT,
    "departam" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "ubigeo" TEXT NOT NULL,
    "kanexo" TEXT NOT NULL,
    "telefalm" TEXT,
    "logoalm" TEXT,
    "flg_stock" BOOLEAN NOT NULL DEFAULT false,
    "flg_acu" BOOLEAN NOT NULL DEFAULT false,
    "usuario" INTEGER NOT NULL,

    CONSTRAINT "Almacen_pkey" PRIMARY KEY ("codalm")
);
