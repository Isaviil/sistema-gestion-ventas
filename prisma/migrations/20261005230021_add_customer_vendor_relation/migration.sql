/*
  Warnings:

  - You are about to drop the `Seller` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Seller";

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_id_ven_fkey" FOREIGN KEY ("id_ven") REFERENCES "Vendor"("id_aux") ON DELETE RESTRICT ON UPDATE CASCADE;
