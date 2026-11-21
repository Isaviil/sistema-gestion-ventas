import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IGuiaRemisionListado } from "../types";

interface IGuiaRemisionResponse {
  data: IGuiaRemisionListado[];
}

export const getGuiaRemisionAnioMes = async (
  searchValueAnio: string,
  searchValueMes: string,
): Promise<IGuiaRemisionListado[]> => {
  const { data }: { data: IGuiaRemisionResponse } = await axios.get(
    "/guia-remision",
    {
      params: {
        ft: "year_month",
        ano: searchValueAnio,
        mes: searchValueMes.padStart(2, "0"),
      },
    },
  );

  return data.data;
};

export const getGuiaRemisionRangoFechas = async (
  searchFechaInicio: string,
  searchFechaFin: string,
): Promise<IGuiaRemisionListado[]> => {
  const { data }: { data: IGuiaRemisionResponse } = await axios.get(
    "/guia-remision",
    {
      params: {
        ft: "date_range",
        start: searchFechaInicio,
        end: searchFechaFin,
      },
    },
  );

  return data.data;
};

const getMyDateString = (fecha: string) => {
  const fechaAux = new Date(`${fecha}T00:00:00`);
  const yy = fechaAux.getFullYear();
  const mm = String(fechaAux.getMonth() + 1).padStart(2, "0");
  const dd = String(fechaAux.getDate()).padStart(2, "0");

  return `${yy}-${mm}-${dd}`;
};

export const useListarGuiaRemision = (
  tipoFiltro: string,
  searchValueAnio: string,
  searchValueMes: string,
  searchFechaInicio: string,
  searchFechaFin: string,
) => {
  const isYearMonth = tipoFiltro === "year_month";

  const queryKey = isYearMonth
    ? ["guia-remision", "year_month", searchValueAnio, searchValueMes]
    : ["guia-remision", "date_range", searchFechaInicio, searchFechaFin];

  const queryFn = isYearMonth
    ? () => getGuiaRemisionAnioMes(searchValueAnio, searchValueMes)
    : () =>
        getGuiaRemisionRangoFechas(
          getMyDateString(searchFechaInicio),
          getMyDateString(searchFechaFin),
        );

  const isEnabled = isYearMonth
    ? Boolean(searchValueAnio && searchValueMes)
    : Boolean(searchFechaInicio && searchFechaFin);

  return useQuery({
    queryKey,
    queryFn,
    refetchOnWindowFocus: true,
    enabled: isEnabled,
    retry: 1,
  });
};
