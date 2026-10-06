import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ICustomerResponse } from "../types";

interface ApiResponse<T> {
  data: T;
}

const getCustomers = async (): Promise<ICustomerResponse[]> => {
  const { data } =
    await axios.get<ApiResponse<ICustomerResponse[]>>("/clientes");

  return data?.data ?? [];
};

export const useListClientes = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
