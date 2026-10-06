export interface CreateVendedorRequest {
  nom_aux: string;
  ape_aux: string;
  ape_mat: string;
  tdoc_ide: string;
  ndoc_ide: string;
  cel_job: string;
  email_job: string;
}

export interface Vendedor {
  id_aux: number;
  cod_ven: string;
  nom_aux: string;
  ape_aux: string;
  ape_mat: string;
  des_aux: string;
  tdoc_ide: string;
  ndoc_ide: string;
  cel_job: string;
  email_job: string;
  fec_reg: string;
  flg_baja: boolean;
  flg_tda: boolean;
  basico: number;
  id_area: number;
}
