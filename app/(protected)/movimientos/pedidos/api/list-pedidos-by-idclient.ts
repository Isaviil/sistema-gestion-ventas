import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IPedidoPorCliente } from "../types";

interface GetPedidosPorClienteResponse {
  data: IPedidoPorCliente[];
}

const getPedidosPorCliente = async (
  id_clie: number | null,
): Promise<IPedidoPorCliente[]> => {
  const { data: response } = await axios.get<GetPedidosPorClienteResponse>(
    `/pedidos/por-cliente/${id_clie}`,
  );

  return response.data;
};

export const usePedidosPorCliente = (id_clie: number | null) => {
  return useQuery({
    queryKey: ["pedidos", "por-cliente", id_clie],
    queryFn: () => getPedidosPorCliente(id_clie),
    enabled: !!id_clie,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
