import axios, { isAxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

type ApiPeruResponse = {
  success: boolean;
  dni?: string;
  ruc?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  razonSocial?: string;
  direccion?: string;
  ubigeo?: string;
  codVerifica?: number;
  codVerificaLetra?: string;
  message?: string;
};

type ApiErrorResponse = {
  message?: string;
};

export const useConsultaSunat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiPeruResponse | null>(null);

  const consultarDocumento = async (tipo: "dni" | "ruc", numero: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/servicios/consulta-sunat?tipo=${tipo}&numero=${encodeURIComponent(numero)}`,
      );

      const resultData = response.data;
      setData(resultData);
      return resultData;
    } catch (err) {
      const errorMessage = isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.message ||
          (err.response?.status === 404
            ? `No se encontraron datos para el ${tipo.toUpperCase()} ingresado`
            : err.message)
        : err instanceof Error
          ? err.message
          : "Error al consultar los datos";

      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { consultarDocumento, isLoading, error, data };
};
