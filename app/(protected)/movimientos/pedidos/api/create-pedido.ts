import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { IPedidoCabeceraForm, IPedidoDetalleForm } from "../types";

export interface IPedidoPostRequest {
  cabecera: IPedidoCabeceraForm;
  detalle: IPedidoDetalleForm[];
}

interface CreatePedidoResponse {
  message: string;
  id_ped: number;
}

const createPedido = async (
  data: IPedidoPostRequest,
): Promise<CreatePedidoResponse> => {
  const { data: response } = await axios.post<CreatePedidoResponse>(
    "/pedidos",
    data,
  );

  return response;
};

export const useCreatePedido = () => {
  return useMutation({
    mutationFn: createPedido,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["pedidos"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al crear el pedido";
      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
