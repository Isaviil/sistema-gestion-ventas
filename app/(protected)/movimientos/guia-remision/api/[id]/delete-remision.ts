import { axios } from "@/app/lib/axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

type DeleteGuiaRemisionResponse = {
  message: string;
};

const deleteGuiaRemision = async (
  idRemision: number,
): Promise<DeleteGuiaRemisionResponse> => {
  const { data } = await axios.delete<DeleteGuiaRemisionResponse>(
    `/guia-remision/${idRemision}`,
  );

  return data;
};

export const useDeleteGuiaRemision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGuiaRemision,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["guia-remision"],
      });

      toast.success(data.message, { autoClose: 2000 });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message ?? "Error al eliminar la remisión",
        { autoClose: 2000 },
      );
    },
  });
};
