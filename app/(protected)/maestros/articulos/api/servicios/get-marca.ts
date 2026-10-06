import { BrandResponse } from "@/app/api/servicios/types/marca";
import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const getBrands = async (): Promise<BrandResponse[]> => {
  const { data } = await axios.get<{ data: BrandResponse[] }>(
    "/servicios/marca",
  );

  return data.data;
};

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
};
