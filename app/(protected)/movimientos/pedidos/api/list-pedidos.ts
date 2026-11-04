import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { IPedidoListado } from "../types";

interface IPedidosResponse {
  data: IPedidoListado[];
}

export const getPedidosAnioMes = async (
  searchValueAnio: string,
  searchValueMes: string,
): Promise<IPedidoListado[]> => {
  const { data }: { data: IPedidosResponse } = await axios.get("/pedidos", {
    params: {
      ft: "year_month",
      ano: searchValueAnio,
      mes: searchValueMes.padStart(2, "0"),
    },
  });

  return data.data;
};

export const getPedidosRangoFechas = async (
  searchFechaInicio: string,
  searchFechaFin: string,
): Promise<IPedidoListado[]> => {
  const { data }: { data: IPedidosResponse } = await axios.get("/pedidos", {
    params: {
      ft: "date_range",
      start: searchFechaInicio,
      end: searchFechaFin,
    },
  });

  return data.data;
};

const getMyDateString = (fecha: string) => {
  const fechaAux = new Date(`${fecha}T00:00:00`);
  const yy = fechaAux.getFullYear();
  const mm = String(fechaAux.getMonth() + 1).padStart(2, "0");
  const dd = String(fechaAux.getDate()).padStart(2, "0");

  return `${yy}-${mm}-${dd}`;
};

export const usePedidos = (
  tipoFiltro: string,
  searchValueAnio: string,
  searchValueMes: string,
  searchFechaInicio: string,
  searchFechaFin: string,
) => {
  const isYearMonth = tipoFiltro === "year_month";

  const queryKey = isYearMonth
    ? ["pedidos", "year_month", searchValueAnio, searchValueMes]
    : ["pedidos", "date_range", searchFechaInicio, searchFechaFin];

  const queryFn = isYearMonth
    ? () => getPedidosAnioMes(searchValueAnio, searchValueMes)
    : () =>
        getPedidosRangoFechas(
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
