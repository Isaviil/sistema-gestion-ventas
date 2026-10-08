import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IAlmacenList } from "../../types";

export const getAlmacenById = async (id: number): Promise<IAlmacenList> => {
  const { data } = await axios.get<IAlmacenList>(`/almacenes/${id}`);

  return data;
};

export const useAlmacenById = (id: number) => {
  return useQuery({
    queryKey: ["almacen", id],
    queryFn: () => getAlmacenById(id),
    enabled: !!id,
  });
};
