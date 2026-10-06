import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { CreateTipoDocumentoRequest, TipoDocumento } from "../../types";

interface UpdateTipoDocumentoResponse {
  message: string;
  data: TipoDocumento;
}

export const updateTipoDocumento = async (
  id: number,
  data: CreateTipoDocumentoRequest,
): Promise<UpdateTipoDocumentoResponse> => {
  const { data: response } = await axios.put<UpdateTipoDocumentoResponse>(
    `/tipo-de-documento/${id}`,
    {
      value: data,
    },
  );

  return response;
};

export const useUpdateTipoDocumento = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CreateTipoDocumentoRequest;
    }) => updateTipoDocumento(id, data),
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
        error.response?.data?.message ??
        "Error al actualizar el tipo de documento";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
