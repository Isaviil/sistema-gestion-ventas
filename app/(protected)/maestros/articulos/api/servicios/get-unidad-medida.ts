import { UnitOfMeasureResponse } from "@/app/api/servicios/types/unidad-medida";
import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const getUnitsOfMeasure = async (): Promise<UnitOfMeasureResponse[]> => {
  const { data } = await axios.get<{ data: UnitOfMeasureResponse[] }>(
    "/servicios/unidad-medida",
  );

  return data.data;
};

export const useUnitsOfMeasure = () => {
  return useQuery({
    queryKey: ["units-of-measure"],
    queryFn: getUnitsOfMeasure,
  });
};
