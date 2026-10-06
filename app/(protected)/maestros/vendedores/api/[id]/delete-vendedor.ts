import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";

export const deleteVendedor = async (
  id: number,
): Promise<{ message: string }> => {
  const { data: response } = await axios.delete<{ message: string }>(
    `/vendedores/${id}`,
  );

  return response;
};

export const useDeleteVendedor = () => {
  return useMutation({
    mutationFn: deleteVendedor,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["vendedores"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al eliminar el vendedor";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
