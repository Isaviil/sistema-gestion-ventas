import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IFacturaListado } from "../types";

interface IFacturacionResponse {
  data: IFacturaListado[];
}

export const getFacturasAnioMes = async (
  searchValueAnio: string,
  searchValueMes: string,
): Promise<IFacturaListado[]> => {
  const { data }: { data: IFacturacionResponse } = await axios.get(
    "/facturas",
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

export const getFacturasRangoFechas = async (
  searchFechaInicio: string,
  searchFechaFin: string,
): Promise<IFacturaListado[]> => {
  const { data }: { data: IFacturacionResponse } = await axios.get(
    "/facturas",
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

export const useListarFacturas = (
  tipoFiltro: string,
  searchValueAnio: string,
  searchValueMes: string,
  searchFechaInicio: string,
  searchFechaFin: string,
) => {
  const isYearMonth = tipoFiltro === "year_month";

  const queryKey = isYearMonth
    ? ["facturas", "year_month", searchValueAnio, searchValueMes]
    : ["facturas", "date_range", searchFechaInicio, searchFechaFin];

  const queryFn = isYearMonth
    ? () => getFacturasAnioMes(searchValueAnio, searchValueMes)
    : () =>
        getFacturasRangoFechas(
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
