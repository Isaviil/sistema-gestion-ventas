import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const deleteTipoCambio = async (
  id: string,
): Promise<{ message: string }> => {
  const { data: response } = await axios.delete<{ message: string }>(
    `/tipo-de-cambio/${id}`,
  );

  return response;
};

export const useDeleteTipoCambio = () => {
  return useMutation({
    mutationFn: (id: string) => deleteTipoCambio(id),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["tipo-cambio"],
      });

      toast.success(response.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ?? "Error al eliminar el tipo de cambio",
      );
    },
  });
};
