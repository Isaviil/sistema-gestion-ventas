-- CreateTable
CREATE TABLE "Chofer" (
    "id_chof" SERIAL NOT NULL,
    "brevete" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Chofer_pkey" PRIMARY KEY ("id_chof")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chofer_brevete_key" ON "Chofer"("brevete");

-- CreateIndex
CREATE UNIQUE INDEX "Chofer_dni_key" ON "Chofer"("dni");
