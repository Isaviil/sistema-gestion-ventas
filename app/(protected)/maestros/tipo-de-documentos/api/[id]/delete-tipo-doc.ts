import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";

export const deleteTipoDocumento = async (
  id: number,
): Promise<{ message: string }> => {
  const { data: response } = await axios.delete<{ message: string }>(
    `/tipo-de-documento/${id}`,
  );

  return response;
};

export const useDeleteTipoDocumento = () => {
  return useMutation({
    mutationFn: deleteTipoDocumento,
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
        "Error al eliminar el tipo de documento";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
