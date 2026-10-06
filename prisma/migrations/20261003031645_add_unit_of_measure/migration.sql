-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id_umed" INTEGER NOT NULL,
    "des_umed" TEXT NOT NULL,
    "alias_umed" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "reservado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id_umed")
);
