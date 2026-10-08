import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { CreateChoferRequest, IChofer } from "../types";
import { AxiosError } from "axios";

interface CreateTransportistaResponse {
  message: string;
  data: IChofer;
}

export const createTransportista = async (
  data: CreateChoferRequest,
): Promise<CreateTransportistaResponse> => {
  const { data: response } = await axios.post<CreateTransportistaResponse>(
    "/transportistas",
    data,
  );

  return response;
};

export const useCreateTransportista = () => {
  return useMutation({
    mutationFn: createTransportista,
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["transportistas"],
      });

      toast.success(response.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al crear el transportista";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
