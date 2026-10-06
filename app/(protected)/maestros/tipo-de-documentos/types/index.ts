export interface CreateTipoDocumentoRequest {
  alias_alm: string | null;
  codsunat: string | null;
  dcor_tdoc: string;
  dlar_tdoc: string;
  flg_alm: boolean;
  flg_sunat: boolean;
  flg_vta: boolean;
}

export interface TipoDocumento {
  id_tipdoc: number;
  alias_alm: string | null;
  flg_sunat: boolean;
  codsunat: string | null;
  dcor_tdoc: string;
  dlar_tdoc: string;
  flg_vta: boolean;
  flg_alm: boolean;
  flg_provi: boolean;
}
