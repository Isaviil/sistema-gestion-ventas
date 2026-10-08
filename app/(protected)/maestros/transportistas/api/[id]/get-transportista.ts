import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IChofer } from "../../types";

export const getTransportistaById = async (id: number): Promise<IChofer> => {
  const { data } = await axios.get<IChofer>(`/transportistas/${id}`);

  return data;
};

export const useTransportistaById = (id: number) => {
  return useQuery({
    queryKey: ["transportista", id],
    queryFn: () => getTransportistaById(id),
    enabled: !!id,
  });
};
