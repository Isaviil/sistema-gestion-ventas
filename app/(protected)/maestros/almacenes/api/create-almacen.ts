import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { IAlmacen, IAlmacenList } from "../types";

export interface CreateAlmacenResponse {
  message: string;
  data: IAlmacenList;
}

export const createAlmacen = async (
  data: IAlmacen,
): Promise<CreateAlmacenResponse> => {
  const { data: response } = await axios.post<CreateAlmacenResponse>(
    "/almacenes",
    data,
  );

  return response;
};

export const useCreateAlmacen = () => {
  return useMutation({
    mutationFn: createAlmacen,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["almacenes"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? "Error al crear el almacén");
    },
  });
};
