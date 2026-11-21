import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IRemisionPorCliente } from "../types";

interface GetRemisionesPorClienteResponse {
  data: IRemisionPorCliente[];
}

const getRemisionesPorCliente = async (
  idaux: number | null,
): Promise<IRemisionPorCliente[]> => {
  const { data: response } = await axios.get<GetRemisionesPorClienteResponse>(
    `/guia-remision/por-cliente/${idaux}`,
  );

  return response.data;
};

export const useRemisionesPorCliente = (idaux: number | null) => {
  return useQuery({
    queryKey: ["remisiones", "por-cliente", idaux],
    queryFn: () => getRemisionesPorCliente(idaux),
    enabled: !!idaux,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
