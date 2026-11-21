"use client";

import { useParams } from "next/navigation";
import { useFacturaByID } from "../api/[id]/get-factura";
import LoadingSidebar from "@/app/components/loading/LoadingSidebar";
import FormularioFactura from "../components/formulario";

export default function FacturaPage() {
  const { id_cpc } = useParams<{ id_cpc: string }>();

  const { data, isLoading, isFetching, isError } = useFacturaByID(
    Number(id_cpc) || null,
  );

  if (isLoading || isFetching) {
    return <LoadingSidebar />;
  }

  if (isError || !data) return <p>No se pudo obtener la factura.</p>;

  return (
    <FormularioFactura isAdd={false} id_cpc={Number(id_cpc)} factura={data} />
  );
}
