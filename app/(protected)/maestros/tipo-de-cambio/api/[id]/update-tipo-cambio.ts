import { queryClient } from "@/app/lib/react-query";
import { CreateTipoCambioRequest, TipoCambio } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

interface UpdateTipoCambioResponse {
  message: string;
  data: TipoCambio;
}

interface ErrorResponse {
  message: string;
}

export const updateTipoCambio = async (
  id: string,
  data: CreateTipoCambioRequest,
): Promise<UpdateTipoCambioResponse> => {
  const { data: response } = await axios.put<UpdateTipoCambioResponse>(
    `/tipo-de-cambio/${id}`,
    {
      value: data,
    },
  );

  return response;
};

export const useUpdateTipoCambio = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTipoCambioRequest }) =>
      updateTipoCambio(id, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["tipo-cambio"],
      });
      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message ??
          "Error al actualizar el tipo de cambio",
      );
    },
  });
};
