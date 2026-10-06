import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Vehiculo } from "../types";

interface VehiculosResponse {
  data: Vehiculo[];
}

export const getVehiculos = async (): Promise<Vehiculo[]> => {
  const { data: response } = await axios.get<VehiculosResponse>("/vehiculos");

  return response.data;
};

export const useVehiculos = () => {
  return useQuery({
    queryKey: ["vehiculos"],
    queryFn: getVehiculos,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
