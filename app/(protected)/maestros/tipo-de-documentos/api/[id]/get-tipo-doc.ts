import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { TipoDocumento } from "../../types";

export const getTipoDocumento = async (id: number): Promise<TipoDocumento> => {
  const { data: response } = await axios.get<TipoDocumento>(
    `/tipo-de-documento/${id}`,
  );

  return response;
};

export const useTipoDocumento = (id: number) => {
  return useQuery({
    queryKey: ["tipo-documento", id],
    queryFn: () => getTipoDocumento(id),
    enabled: !!id,
  });
};
