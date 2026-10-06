import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";

interface DeleteVehiculoResponse {
  message: string;
}

export const deleteVehiculo = async (
  id: number,
): Promise<DeleteVehiculoResponse> => {
  const { data: response } = await axios.delete<DeleteVehiculoResponse>(
    `/vehiculos/${id}`,
  );

  return response;
};

export const useDeleteVehiculo = () => {
  return useMutation({
    mutationFn: deleteVehiculo,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["vehiculos"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
  });
};
