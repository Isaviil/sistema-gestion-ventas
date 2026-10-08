import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const deleteTransportista = async (
  id: number,
): Promise<{ message: string }> => {
  const { data: response } = await axios.delete<{ message: string }>(
    `/transportistas/${id}`,
  );

  return response;
};

export const useDeleteTransportista = () => {
  return useMutation({
    mutationFn: (id: number) => deleteTransportista(id),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["transportistas"],
      });

      toast.success(response.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ?? "Error al eliminar el transportista",
      );
    },
  });
};
