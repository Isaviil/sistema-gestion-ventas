/*
  Warnings:

  - You are about to drop the column `web` on the `Customer` table. All the data in the column will be lost.
  - Made the column `ubigeo` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departamento` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `provincia` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `distrito` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_ven` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_tpoclie` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "web",
ADD COLUMN     "referencia" TEXT,
ALTER COLUMN "ubigeo" SET NOT NULL,
ALTER COLUMN "departamento" SET NOT NULL,
ALTER COLUMN "provincia" SET NOT NULL,
ALTER COLUMN "distrito" SET NOT NULL,
ALTER COLUMN "id_ven" SET NOT NULL,
ALTER COLUMN "id_tpoclie" SET NOT NULL;
