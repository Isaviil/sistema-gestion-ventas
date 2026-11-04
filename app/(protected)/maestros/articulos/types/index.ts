export interface CreateProductRequest {
  cod_art: string | null;
  des_art: string;
  des_art2: string | null;
  stkact: number;
  peso: number | null;
  pre_art: number;
  pv2: number | null;
  pv3: number | null;
  pv4: number | null;
  id_umedr: number | null;
  id_fam: number | null;
  id_corte: number | null;
  id_mar: number | null;
  id_color: number | null;
  id_talla: number | null;
}

export interface ProductResponse {
  cod_art: string;
  des_art: string;
  des_art2: string | null;
  flg_activo: boolean;
  id_art: number;
  id_color: number | null;
  id_corte: number | null;
  id_fam: number | null;
  id_mar: number | null;
  id_talla: number | null;
  id_umedr: number;
  peso: number | null;
  pre_art: number;
  pv2: number | null;
  pv3: number | null;
  pv4: number | null;
  stkact: number;
}

// El dialog edit detalle
export interface IDetallePrecios {
  pre_art: number;
  pdes_art: number;
  pu_des: number;
  pu_conigv: number;
  pu_sinigv: number;
  can_art: number;
  tot_art: number;
  operador: string;
  subtot_art: number;
}
