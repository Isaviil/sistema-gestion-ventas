import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ProductResponse } from "../../types";

export const getProductById = async (id: number): Promise<ProductResponse> => {
  const { data } = await axios.get<ProductResponse>(`/articulos/${id}`);

  return data;
};

export const useProductById = (id: number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};
