import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const deleteAlmacen = async (
  id: number,
): Promise<{ message: string }> => {
  const { data: response } = await axios.delete<{ message: string }>(
    `/almacenes/${id}`,
  );

  return response;
};

export const useDeleteAlmacen = () => {
  return useMutation({
    mutationFn: (id: number) => deleteAlmacen(id),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["almacenes"],
      });

      toast.success(response.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ?? "Error al eliminar el almacén",
      );
    },
  });
};
