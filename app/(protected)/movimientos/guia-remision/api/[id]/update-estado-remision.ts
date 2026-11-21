import { axios } from "@/app/lib/axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

type TPropAnularGuiaRemision = {
  idRemision: number;
};

type AnularGuiaRemisionResponse = {
  message: string;
  data: {
    id_remision: number;
    numero: string;
    estado: string;
    flg_anu: boolean;
  };
};

const anularGuiaRemision = async ({
  idRemision,
}: TPropAnularGuiaRemision): Promise<AnularGuiaRemisionResponse> => {
  const { data } = await axios.patch<AnularGuiaRemisionResponse>(
    `/guia-remision/${idRemision}`,
    { accion: "anular" },
  );

  return data;
};

export const useAnularGuiaRemision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: anularGuiaRemision,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["guiaremision"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["guiaRemisionID"],
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
