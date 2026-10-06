import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { ICustomerCreateRequest, ICustomerResponse } from "../types";

interface ICustomerCreateResponse {
  message: string;
  data: ICustomerResponse;
}

const createCustomer = async (
  data: ICustomerCreateRequest,
): Promise<ICustomerCreateResponse> => {
  const { data: response } = await axios.post<ICustomerCreateResponse>(
    "/clientes",
    data,
  );

  return response;
};

export const useCreateCliente = () => {
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? "Error al crear el cliente");
    },
  });
};
