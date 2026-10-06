-- CreateTable
CREATE TABLE "Vehicle" (
    "id_vehi" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "certificado" TEXT,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id_vehi")
);
