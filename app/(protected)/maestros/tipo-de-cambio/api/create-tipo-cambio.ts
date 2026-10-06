import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { CreateTipoCambioRequest, TipoCambio } from "../types";

export const createTipoCambio = async (
  data: CreateTipoCambioRequest,
): Promise<TipoCambio> => {
  const { data: response } = await axios.post<{
    message: string;
    data: TipoCambio;
  }>("/tipo-de-cambio", {
    value: data,
  });

  return response.data;
};

export const useCreateTipoCambio = () => {
  return useMutation({
    mutationFn: createTipoCambio,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["tipo-cambio"],
      });
      toast.success("Tipo de cambio creado correctamente", {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ?? "Error al crear el tipo de cambio",
      );
    },
  });
};
