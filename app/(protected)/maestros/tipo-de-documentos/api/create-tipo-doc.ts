import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { CreateTipoDocumentoRequest, TipoDocumento } from "../types";

interface CreateTipoDocumentoResponse {
  message: string;
  data: TipoDocumento;
}

export const createTipoDocumento = async (
  data: CreateTipoDocumentoRequest,
): Promise<CreateTipoDocumentoResponse> => {
  const { data: response } = await axios.post<CreateTipoDocumentoResponse>(
    "/tipo-de-documento",
    {
      value: data,
    },
  );

  return response;
};

export const useCreateTipoDocumento = () => {
  return useMutation({
    mutationFn: createTipoDocumento,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["tipos-documento"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al crear el tipo de documento";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
