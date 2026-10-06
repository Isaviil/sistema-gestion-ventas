import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { TipoCambio } from "../../types";

export const getTipoCambioById = async (id: string): Promise<TipoCambio> => {
  const { data } = await axios.get<TipoCambio>(`/tipo-de-cambio/${id}`);

  return data;
};

export const useTipoCambioById = (id: string) => {
  return useQuery({
    queryKey: ["tipo-cambio", id],
    queryFn: () => getTipoCambioById(id),
    enabled: !!id,
  });
};
