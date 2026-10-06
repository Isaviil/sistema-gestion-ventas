import { ProductFamilyResponse } from "@/app/api/servicios/types/grupos";
import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const getGroups = async (): Promise<ProductFamilyResponse[]> => {
  const { data } = await axios.get<{ data: ProductFamilyResponse[] }>(
    "/servicios/grupos",
  );

  return data.data;
};

export const useGroups = () => {
  return useQuery({
    queryKey: ["product-groups"],
    queryFn: getGroups,
  });
};
