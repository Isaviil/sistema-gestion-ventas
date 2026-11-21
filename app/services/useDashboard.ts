import { axios } from "@/app/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type DashboardFiltroTipo = "year_month" | "date_range";

export interface DashboardParams {
  ft: DashboardFiltroTipo;
  ano?: string;
  mes?: string;
  start?: string;
  end?: string;
}

export interface PendienteRecienteItem {
  id_ped: number;
  nrodoc: string;
  nomaux: string;
  vendedor: string;
  codmon: string;
  imptot: number;
  estado: string;
  fchdoc: string;
}

export interface DashboardResponse {
  kpis: {
    facturacion: {
      activasCount: number;
      anuladasCount: number;
      totalSoles: number;
      totalDolares: number;
    };
    pedidos: {
      activosCount: number;
      pendientesCount: number;
      anuladasCount: number;
    };
    remisiones: {
      activasCount: number;
      anuladasCount: number;
    };
    totalAnulaciones: number;
  };
  pendientesRecientes: PendienteRecienteItem[];
}

const getDashboard = async (
  params: DashboardParams,
): Promise<DashboardResponse> => {
  const { data } = await axios.get<DashboardResponse>("/dashboard", {
    params,
  });

  return data;
};

export const useDashboard = (params: DashboardParams, enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", params],
    queryFn: () => getDashboard(params),
    enabled,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
