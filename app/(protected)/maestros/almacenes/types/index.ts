// Post
export interface IAlmacen {
  aliasalm: string;
  desalm: string;
  diralm?: string | null;
  departam: string;
  provincia: string;
  distrito: string;
  ubigeo: string;
  kanexo: string;
  telefalm?: string | null;
  logoalm?: string | null;
  flg_stock: boolean;
  flg_acu: boolean;
  usuario: number | null;
}

// Listado general
export interface IAlmacenList extends IAlmacen {
  codalm: number;
  fch_reg: string;
  flg_ok: boolean;
  reservado: boolean;
}
