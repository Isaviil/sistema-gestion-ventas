import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ProductResponse } from "../types";

export interface ApiResponse<T> {
  data: T;
}

export const getProducts = async (): Promise<ProductResponse[]> => {
  const { data } =
    await axios.get<ApiResponse<ProductResponse[]>>("/articulos");
  return data?.data ?? [];
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
