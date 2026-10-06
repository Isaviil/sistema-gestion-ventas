import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { CreateVehiculoRequest, Vehiculo } from "../types";
import { AxiosError } from "axios";

interface CreateVehiculoResponse {
  data: Vehiculo;
}

export const createVehiculo = async (
  data: CreateVehiculoRequest,
): Promise<CreateVehiculoResponse> => {
  const { data: response } = await axios.post<CreateVehiculoResponse>(
    "/vehiculos",
    {
      cabecera: data,
    },
  );

  return response;
};

export const useCreateVehiculo = () => {
  return useMutation({
    mutationFn: createVehiculo,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["vehiculos"],
      });

      toast.success("Vehículo creado correctamente", {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al crear el vehículo";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
