"use client";

import { useParams } from "next/navigation";
import { useGuiaRemisionByID } from "../api/[id]/get-remision";
import LoadingSidebar from "@/app/components/loading/LoadingSidebar";
import FormularioGuiaRemision from "../components/formulario";

export default function RemisionPage() {
  const { id_rem } = useParams<{ id_rem: string }>();
  const { data, isLoading, isFetching, isError } = useGuiaRemisionByID(
    Number(id_rem) || null,
  );

  if (isLoading || isFetching) {
    return <LoadingSidebar />;
  }

  if (isError || !data) return <p>No se pudo obtener la remisión.</p>;

  return (
    <FormularioGuiaRemision
      isAdd={false}
      id_remision={Number(id_rem)}
      remision={data}
    />
  );
}
