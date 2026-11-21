import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IFacturaPorCliente } from "../types";

interface GetFacturasPorClienteResponse {
  data: IFacturaPorCliente[];
}

const getFacturasPorCliente = async (
  idaux: number | null,
): Promise<IFacturaPorCliente[]> => {
  const { data: response } = await axios.get<GetFacturasPorClienteResponse>(
    `/facturas/por-cliente/${idaux}`,
  );

  return response.data;
};

export const useFacturasPorCliente = (idaux: number | null) => {
  return useQuery({
    queryKey: ["facturas", "por-cliente", idaux],
    queryFn: () => getFacturasPorCliente(idaux),
    enabled: !!idaux,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
