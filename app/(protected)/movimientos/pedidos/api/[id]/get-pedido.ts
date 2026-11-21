import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IPedidoCabeceraPorID, IPedidoDetallePorID } from "../../types";

interface PedidoPorIDResponse {
  message: string;
  cabecera: IPedidoCabeceraPorID;
  detalle: IPedidoDetallePorID[];
}

const getPedidoPorID = async (
  idPed: number | null,
): Promise<PedidoPorIDResponse | null> => {
  if (!idPed) return null;

  const { data } = await axios.get<PedidoPorIDResponse>(`/pedidos/${idPed}`);

  return data;
};

export const usePedidoByID = (idPed: number | null) => {
  return useQuery({
    queryKey: ["pedidoID", idPed],
    queryFn: () => getPedidoPorID(idPed),
    enabled: !!idPed,
    retry: 1,
    refetchOnWindowFocus: true,
  });
};
