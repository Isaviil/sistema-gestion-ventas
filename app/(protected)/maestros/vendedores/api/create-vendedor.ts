import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { CreateVendedorRequest, Vendedor } from "../types";

interface CreateVendedorResponse {
  message: string;
  data: Vendedor;
}

export const createVendedor = async (
  data: CreateVendedorRequest,
): Promise<CreateVendedorResponse> => {
  const { data: response } = await axios.post<CreateVendedorResponse>(
    "/vendedores",
    {
      value: data,
    },
  );

  return response;
};

export const useCreateVendedor = () => {
  return useMutation({
    mutationFn: createVendedor,
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
        error.response?.data?.message ?? "Error al crear el vendedor";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
