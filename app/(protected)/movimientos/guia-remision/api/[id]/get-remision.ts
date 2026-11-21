import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import {
  IGuiaRemisionCabeceraPorID,
  IGuiaremisionDetalleFormState,
} from "../../types";

interface GuiaRemisionPorIDResponse {
  message: string;
  cabecera: IGuiaRemisionCabeceraPorID;
  detalle: IGuiaremisionDetalleFormState[];
}

const getGuiaRemisionPorID = async (
  idRemision: number | null,
): Promise<GuiaRemisionPorIDResponse | null> => {
  if (!idRemision) return null;

  const { data } = await axios.get<GuiaRemisionPorIDResponse>(
    `/guia-remision/${idRemision}`,
  );

  return data;
};

export const useGuiaRemisionByID = (idRemision: number | null) => {
  return useQuery({
    queryKey: ["guiaRemisionID", idRemision],
    queryFn: () => getGuiaRemisionPorID(idRemision),
    enabled: !!idRemision,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
