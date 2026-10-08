/*
  Warnings:

  - The primary key for the `Almacen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `codalm` column on the `Almacen` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Almacen" DROP CONSTRAINT "Almacen_pkey",
DROP COLUMN "codalm",
ADD COLUMN     "codalm" SERIAL NOT NULL,
ADD CONSTRAINT "Almacen_pkey" PRIMARY KEY ("codalm");
