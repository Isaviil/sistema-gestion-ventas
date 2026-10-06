import { ProductColorResponse } from "@/app/api/servicios/types/color";
import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const getColors = async (): Promise<ProductColorResponse[]> => {
  const { data } = await axios.get<{ data: ProductColorResponse[] }>(
    "/servicios/colores",
  );

  return data.data;
};

export const useColors = () => {
  return useQuery({
    queryKey: ["product-colors"],
    queryFn: getColors,
  });
};
