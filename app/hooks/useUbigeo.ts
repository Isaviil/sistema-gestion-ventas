import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IUbigeoResponse } from "../api/servicios/types/ubigeo";

interface ApiResponse<T> {
  data: T;
}

const getUbigeos = async (): Promise<IUbigeoResponse> => {
  const { data } =
    await axios.get<ApiResponse<IUbigeoResponse>>("/servicios/ubigeo");

  return data.data;
};

export const useUbigeo = () => {
  return useQuery({
    queryKey: ["ubigeos"],
    queryFn: getUbigeos,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
