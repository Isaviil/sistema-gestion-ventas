import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { FacturacionCabecera, FacturacionDetalle } from "../types";

export interface IFacturaPostRequest {
  cabecera: FacturacionCabecera;
  detalle: FacturacionDetalle[];
}

interface CreateFacturaResponse {
  message: string;
  id_cpc: number;
}

const createFactura = async (
  data: IFacturaPostRequest,
): Promise<CreateFacturaResponse> => {
  const { data: response } = await axios.post<CreateFacturaResponse>(
    "/facturas",
    data,
  );

  return response;
};

export const useCreateFactura = () => {
  return useMutation({
    mutationFn: createFactura,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["facturas"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message ?? "Error al crear la factura";

      toast.error(message, {
        autoClose: 1600,
      });
    },
  });
};
