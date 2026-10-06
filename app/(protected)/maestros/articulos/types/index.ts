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
  id_art: number;
  cod_art: string;
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
  flg_activo: boolean;
}
