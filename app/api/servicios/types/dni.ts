export interface IConsultaDniResponse {
  success: boolean;
  data: {
    numero: string;
    nombre_completo: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    codigo_verificacion: number;
    direccion: string;
    direccion_completa: string;
    ubigeo_reniec: string;
    ubigeo_sunat: string;
    ubigeo: (string | null)[];
  };
  time: number;
  code: string;
  retryable: boolean;
}
