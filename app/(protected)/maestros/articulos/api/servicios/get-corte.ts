import { ProductCutResponse } from "@/app/api/servicios/types/corte";
import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const getCuts = async (): Promise<ProductCutResponse[]> => {
  const { data } = await axios.get<{ data: ProductCutResponse[] }>(
    "/servicios/corte",
  );

  return data.data;
};

export const useCuts = () => {
  return useQuery({
    queryKey: ["product-cuts"],
    queryFn: getCuts,
  });
};
