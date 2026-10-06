import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Vendedor } from "../types";

interface VendedoresResponse {
  data: Vendedor[];
}

export const getVendedores = async (): Promise<Vendedor[]> => {
  const { data: response } = await axios.get<VendedoresResponse>("/vendedores");

  return response.data;
};

export const useVendedores = () => {
  return useQuery({
    queryKey: ["vendedores"],
    queryFn: getVendedores,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
