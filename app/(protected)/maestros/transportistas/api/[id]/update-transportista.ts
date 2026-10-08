import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { CreateChoferRequest } from "../../types";

export const updateTransportista = async (
  id: number,
  data: CreateChoferRequest,
): Promise<{ message: string }> => {
  const { data: response } = await axios.put<{ message: string }>(
    `/transportistas/${id}`,
    data,
  );

  return response;
};

export const useUpdateTransportista = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateChoferRequest }) =>
      updateTransportista(id, data),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["transportistas"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["transportista"],
      });

      toast.success(response.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ?? "Error al actualizar el transportista",
      );
    },
  });
};
