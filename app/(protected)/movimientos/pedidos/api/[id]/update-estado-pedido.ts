import { axios } from "@/app/lib/axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

type TPropUpdateEstado = {
  idPed: number;
  accion: "aprobar" | "anular";
};

type UpdateEstadoPedidoResponse = {
  message: string;
  data: {
    id_ped: number;
    nrodoc: string;
    estado: string;
  };
};

const updateEstadoPedido = async ({
  idPed,
  accion,
}: TPropUpdateEstado): Promise<UpdateEstadoPedidoResponse> => {
  const { data } = await axios.patch<UpdateEstadoPedidoResponse>(
    `/pedidos/${idPed}`,
    { accion },
  );

  return data;
};

export const useUpdateEstadoPedido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEstadoPedido,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["pedidos"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["pedidoID"],
      });

      toast.success(data.message, { autoClose: 2000 });
    },
    onError: (error) => {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Error al actualizar el estado del pedido", {
        autoClose: 2000,
      });
    },
  });
};
