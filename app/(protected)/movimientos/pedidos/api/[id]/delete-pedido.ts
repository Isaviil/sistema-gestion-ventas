import { axios } from "@/app/lib/axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

type DeletePedidoResponse = {
  message: string;
};

const deletePedido = async (idPed: number): Promise<DeletePedidoResponse> => {
  const { data } = await axios.delete<DeletePedidoResponse>(
    `/pedidos/${idPed}`,
  );

  return data;
};

export const useDeletePedido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePedido,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["pedidos"],
      });

      toast.success(data.message, { autoClose: 2000 });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message ?? "Error al eliminar el pedido",
        { autoClose: 2000 },
      );
    },
  });
};
