import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Vendedor } from "../../types";

export const getVendedor = async (id: number): Promise<Vendedor> => {
  const { data: response } = await axios.get<Vendedor>(`/vendedores/${id}`);

  return response;
};

export const useVendedor = (id: number) => {
  return useQuery({
    queryKey: ["vendedor", id],
    queryFn: () => getVendedor(id),
    enabled: !!id,
  });
};
