-- AddForeignKey
ALTER TABLE "PedidoCabecera" ADD CONSTRAINT "PedidoCabecera_codmon_fkey" FOREIGN KEY ("codmon") REFERENCES "Currency"("codmon") ON DELETE RESTRICT ON UPDATE CASCADE;
