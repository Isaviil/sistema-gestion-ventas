import { axios } from "@/app/lib/axios";
import { IAlmacenList } from "../types";
import { useQuery } from "@tanstack/react-query";

export interface ApiResponse<T> {
  data: T;
}

export const getAlmacenes = async (): Promise<IAlmacenList[]> => {
  const { data } = await axios.get<ApiResponse<IAlmacenList[]>>("/almacenes");

  return data?.data ?? [];
};

export const useAlmacenes = () => {
  return useQuery({
    queryKey: ["almacenes"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
