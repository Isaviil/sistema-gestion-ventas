import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

interface ICustomerDeleteResponse {
  message: string;
}

const deleteCustomer = async (id: number): Promise<ICustomerDeleteResponse> => {
  const { data: response } = await axios.delete<ICustomerDeleteResponse>(
    `/clientes/${id}`,
  );

  return response;
};

export const useDeleteCliente = () => {
  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
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
        error.response?.data?.message ?? "Error al eliminar el cliente",
      );
    },
  });
};
