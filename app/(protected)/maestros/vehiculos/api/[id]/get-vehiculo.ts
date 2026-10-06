import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Vehiculo } from "../../types";

export const getVehiculo = async (id: number): Promise<Vehiculo> => {
  const { data: response } = await axios.get<Vehiculo>(`/vehiculos/${id}`);

  return response;
};

export const useVehiculo = (id: number) => {
  return useQuery({
    queryKey: ["vehiculo", id],
    queryFn: () => getVehiculo(id),
    enabled: !!id,
  });
};
