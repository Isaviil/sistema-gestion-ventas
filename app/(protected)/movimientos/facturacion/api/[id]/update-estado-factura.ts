import { axios } from "@/app/lib/axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

type TPropAnularFactura = {
  idCpc: number;
};

type AnularFacturaResponse = {
  message: string;
  data: {
    id_cpc: number;
    num_doc: string;
    estado: string;
    flg_anu: boolean;
  };
};

const anularFactura = async ({
  idCpc,
}: TPropAnularFactura): Promise<AnularFacturaResponse> => {
  const { data } = await axios.patch<AnularFacturaResponse>(
    `/facturas/${idCpc}`,
    { accion: "anular" },
  );

  return data;
};

export const useAnularFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: anularFactura,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["facturas"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["facturaID"],
      });

      toast.success(data.message, { autoClose: 2000 });
    },
    onError: (error) => {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Error", {
        autoClose: 2000,
      });
    },
  });
};
