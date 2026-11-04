import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface IMoneda {
  codmon: string;
  descrip: string;
  flg_activo: boolean;
}

const getMonedas = async (): Promise<IMoneda[]> => {
  const { data } = await axios.get<IMoneda[]>("/monedas");
  return data;
};

export const useMoneda = () => {
  return useQuery({
    queryKey: ["monedas"],
    queryFn: getMonedas,
  });
};
