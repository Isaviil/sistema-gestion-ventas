import { axios } from "@/app/lib/axios";
import { IChofer } from "../types";
import { useQuery } from "@tanstack/react-query";

export interface ApiResponse<T> {
  data: T;
}

export const getTransportistas = async (): Promise<IChofer[]> => {
  const { data } = await axios.get<ApiResponse<IChofer[]>>("/transportistas");

  return data?.data ?? [];
};

export const useTransportistas = () => {
  return useQuery({
    queryKey: ["transportistas"],
    queryFn: getTransportistas,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
