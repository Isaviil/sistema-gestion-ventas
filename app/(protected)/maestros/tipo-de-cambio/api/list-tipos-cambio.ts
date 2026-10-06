import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { TipoCambio } from "../types";

export interface ApiResponse<T> {
  data: T;
}

export const getTipoCambio = async (): Promise<TipoCambio[]> => {
  const { data } =
    await axios.get<ApiResponse<TipoCambio[]>>("/tipo-de-cambio");

  return data?.data ?? [];
};

export const useTipoCambio = () => {
  return useQuery({
    queryKey: ["tipo-cambio"],
    queryFn: getTipoCambio,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
