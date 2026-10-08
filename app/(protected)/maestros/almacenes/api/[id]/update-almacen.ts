import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { IAlmacen } from "../../types";

export const updateAlmacen = async (
  id: number,
  data: IAlmacen,
): Promise<{ message: string }> => {
  const { data: response } = await axios.put<{ message: string }>(
    `/almacenes/${id}`,
    data,
  );

  return response;
};

export const useUpdateAlmacen = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IAlmacen }) =>
      updateAlmacen(id, data),
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
        error.response?.data?.message ?? "Error al actualizar el almacén",
      );
    },
  });
};
