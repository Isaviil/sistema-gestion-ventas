import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const deleteProduct = async (
  id: number,
): Promise<{ message: string }> => {
  const { data: response } = await axios.delete<{ message: string }>(
    `/articulos/${id}`,
  );

  return response;
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success(response.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ?? "Error al eliminar el artículo",
      );
    },
  });
};
