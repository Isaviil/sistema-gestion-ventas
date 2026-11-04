"use client";

import { useParams } from "next/navigation";
import { usePedidoByID } from "../api/[id]/get-pedido";
import LoadingSidebar from "@/app/components/loading/LoadingSidebar";
import FormularioPedido from "../components/formulario";

export default function PedidoPage() {
  const { id_ped } = useParams<{ id_ped: string }>();

  const { data, isLoading, isFetching, isError } = usePedidoByID(
    Number(id_ped) || null,
  );

  if (isLoading || isFetching) {
    return <LoadingSidebar />;
  }

  if (isError || !data) return <p>No se pudo obtener el pedido.</p>;

  return (
    <FormularioPedido isAdd={false} id_ped={Number(id_ped)} pedido={data} />
  );
}
