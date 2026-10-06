import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { CreateVehiculoRequest, Vehiculo } from "../../types";

interface UpdateVehiculoResponse {
  message: string;
  vehicle: Vehiculo;
}

export const updateVehiculo = async (
  id: number,
  data: CreateVehiculoRequest,
): Promise<UpdateVehiculoResponse> => {
  const { data: response } = await axios.put<UpdateVehiculoResponse>(
    `/vehiculos/${id}`,
    {
      cabecera: data,
    },
  );

  return response;
};

export const useUpdateVehiculo = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateVehiculoRequest }) =>
      updateVehiculo(id, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["vehiculos"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al actualizar el vehículo";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
