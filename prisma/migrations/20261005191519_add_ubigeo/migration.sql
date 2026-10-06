-- CreateTable
CREATE TABLE "Ubigeo" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,

    CONSTRAINT "Ubigeo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ubigeo_codigo_key" ON "Ubigeo"("codigo");
