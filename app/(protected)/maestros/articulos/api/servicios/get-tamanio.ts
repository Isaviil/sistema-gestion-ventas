import { ProductSizeResponse } from "@/app/api/servicios/types/tamanio";
import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const getSizes = async (): Promise<ProductSizeResponse[]> => {
  const { data } = await axios.get<{ data: ProductSizeResponse[] }>(
    "/servicios/tamanio",
  );

  return data.data;
};

export const useSizes = () => {
  return useQuery({
    queryKey: ["product-sizes"],
    queryFn: getSizes,
  });
};
