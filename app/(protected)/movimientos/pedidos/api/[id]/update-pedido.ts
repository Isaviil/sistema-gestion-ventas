import { axios } from "@/app/lib/axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { IPedidoCabeceraForm, IPedidoDetalleForm } from "../../types";

type TPropUpdate = {
  id_ped: number;
  cabecera: IPedidoCabeceraForm;
  detalle: IPedidoDetalleForm[];
};

type CreatePedidoResponse = {
  message: string;
};

const updatePedido = async ({
  id_ped,
  cabecera,
  detalle,
}: TPropUpdate): Promise<CreatePedidoResponse> => {
  const { data } = await axios.put(`/pedidos/${id_ped}`, {
    cabecera,
    detalle,
  });

  return data;
};

export const useUpdatePedido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePedido,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["pedidos"],
      });

      toast.success(data.message, { autoClose: 2000 });
    },
  });
};
