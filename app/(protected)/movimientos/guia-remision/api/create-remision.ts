import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { IGuiaRemisionCabecera, IGuiaRemisionDetalles } from "../types";

export interface IGuiaRemisionPostRequest {
  cabecera: IGuiaRemisionCabecera;
  detalle: IGuiaRemisionDetalles[];
}

interface CreateGuiaRemisionResponse {
  message: string;
  id_remision: number;
}

const createGuiaRemision = async (
  data: IGuiaRemisionPostRequest,
): Promise<CreateGuiaRemisionResponse> => {
  const { data: response } = await axios.post<CreateGuiaRemisionResponse>(
    "/guia-remision",
    data,
  );

  return response;
};

export const useCreateGuiaRemision = () => {
  return useMutation({
    mutationFn: createGuiaRemision,
    onSuccess: async (data) => {
      await void queryClient.invalidateQueries({
        queryKey: ["guiaremision"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al crear la remisión";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
