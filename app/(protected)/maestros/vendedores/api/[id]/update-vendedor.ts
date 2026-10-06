import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { CreateVendedorRequest, Vendedor } from "../../types";

interface UpdateVendedorResponse {
  message: string;
  data: Vendedor;
}

export const updateVendedor = async (
  id: number,
  data: CreateVendedorRequest,
): Promise<UpdateVendedorResponse> => {
  const { data: response } = await axios.put<UpdateVendedorResponse>(
    `/vendedores/${id}`,
    {
      value: data,
    },
  );

  return response;
};

export const useUpdateVendedor = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateVendedorRequest }) =>
      updateVendedor(id, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["vendedores"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al actualizar el vendedor";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
