/*
  Warnings:

  - You are about to drop the column `nom_usu` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellidos` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "nom_usu",
ADD COLUMN     "apellidos" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fec_ult_login" TIMESTAMP(3),
ADD COLUMN     "nombres" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
