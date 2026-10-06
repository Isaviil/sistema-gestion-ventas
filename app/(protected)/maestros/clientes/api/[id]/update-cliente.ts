import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { ICustomerCreateRequest, ICustomerResponse } from "../../types";

interface ICustomerUpdateResponse {
  message: string;
  customer: ICustomerResponse;
}

const updateCustomer = async (
  id: number,
  data: ICustomerCreateRequest,
): Promise<ICustomerUpdateResponse> => {
  const { data: response } = await axios.put<ICustomerUpdateResponse>(
    `/clientes/${id}`,
    data,
  );

  return response;
};

export const useUpdateCliente = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ICustomerCreateRequest }) =>
      updateCustomer(id, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ?? "Error al actualizar el cliente",
      );
    },
  });
};
