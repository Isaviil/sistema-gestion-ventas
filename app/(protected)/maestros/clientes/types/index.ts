export interface ICustomerCreateRequest {
  des_aux: string;
  tipo_pers?: number | null;
  tdoc_ide?: string | null;
  ruc_aux?: string | null;
  dir_legal?: string | null;
  referencia?: string | null;
  telefono?: string | null;
  email?: string | null;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  id_ven: number;
  for_pago?: number | null;
  id_tpoclie: number;
  flg_activo?: boolean;
}

export interface ICustomerResponse {
  id_aux: number;
  des_aux: string;
  tipo_pers: number | null;
  tdoc_ide: string | null;
  ruc_aux: string | null;
  dir_legal: string | null;
  referencia: string | null;
  telefono: string | null;
  email: string | null;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  id_ven: number;
  vendedor: string;
  for_pago: number | null;
  id_tpoclie: number;
  fec_reg: string;
  flg_activo: boolean;
}
