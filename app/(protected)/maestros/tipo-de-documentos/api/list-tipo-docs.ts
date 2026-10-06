import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { TipoDocumento } from "../types";

interface TiposDocumentoResponse {
  data: TipoDocumento[];
}

export const getTiposDocumento = async (): Promise<TipoDocumento[]> => {
  const { data: response } =
    await axios.get<TiposDocumentoResponse>("/tipo-de-documento");

  return response.data;
};

export const useTiposDocumento = () => {
  return useQuery({
    queryKey: ["tipos-documento"],
    queryFn: getTiposDocumento,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
