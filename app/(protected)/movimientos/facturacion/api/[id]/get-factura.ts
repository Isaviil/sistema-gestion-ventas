import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import {
  FacturacionCabeceraFormState,
  FacturacionDetalleFormState,
} from "../../types";

interface FacturaPorIDResponse {
  message: string;
  cabecera: FacturacionCabeceraFormState;
  detalle: FacturacionDetalleFormState[];
}

const getFacturaPorID = async (
  idCpc: number | null,
): Promise<FacturaPorIDResponse | null> => {
  if (!idCpc) return null;

  const { data } = await axios.get<FacturaPorIDResponse>(`/facturas/${idCpc}`);

  return data;
};

export const useFacturaByID = (idCpc: number | null) => {
  return useQuery({
    queryKey: ["facturaID", idCpc],
    queryFn: () => getFacturaPorID(idCpc),
    enabled: !!idCpc,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
