import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ICustomerResponse } from "../../types";

const getCustomer = async (id: number): Promise<ICustomerResponse> => {
  const { data } = await axios.get<ICustomerResponse>(`/clientes/${id}`);

  return data;
};

export const useCliente = (id: number) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
};
