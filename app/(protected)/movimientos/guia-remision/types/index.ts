export interface IGuiaRemisionListado {
  ano: string;
  codmon: string | null;
  dirent: string | null;
  estado: string;
  factura: string | null;
  fch_anu: string | null;
  fch_ing: string | null;
  fchdoc: string;
  flg_anu: boolean;
  flg_incigv: boolean;
  formapago: string | null;
  for_pago: number | null;
  glosa: string | null;
  id_aux: number | null;
  id_cpc: number | null; // <-- Falta este
  id_ped: number | null;
  id_remision: number | null;
  id_ven: number | null;
  mes: string;
  nomaux: string | null;
  numero: string | null;
  pedido: string | null;
  porigv: number;
  rucaux: string | null;
  serie: string;
  tpocmb: number;
  usuario: number | null;
  usuario_anu: number | null;
  usuario_ing: string;
}

export interface IGuiaRemisionCabecera {
  almdes: string | null;
  almori: string | null;
  ano: string;
  bultos: number;
  codalm: string;
  codmon: string | null;
  codmov: string;
  dirent: string | null;
  factura: string | null;
  fchdoc: string;
  fchtras: string;
  flg_incigv: boolean;
  for_pago: number | null;
  glosa: string | null;
  id_remision: number | null;
  id_aux: number | null;
  id_chof: number | null;
  id_ped: number | null;
  id_cpc: number | null;
  id_transp: number | null;
  id_vehi: number | null;
  id_ven: number | null;
  mes: string;
  nomaux: string | null;
  numero: string | null;
  pedido: string | null;
  peso: number;
  porigv: number;
  ptopartida: string | null;
  rucaux: string | null;
  serie: string;
  tpocmb: number;
  ubigeo1: string | null;
  ubigeo2: string | null;
  usuario: number | null;
}

export interface IGuiaRemisionCabeceraPorID extends IGuiaRemisionCabecera {
  estado: string;
  flg_anu: boolean;
  fch_anu: string | null;
  fch_ing: string;
  usu_anu: number | null;
  usuario_anu: string | null;
  usuario_ing: string | null;
}

export interface IGuiaRemisionDetalles {
  can_art: number;
  cod_art: string;
  des_ar1: string | null;
  des_ar2: string | null;
  des_ar3: string | null;
  des_ar4: string | null;
  des_ar5: string | null;
  des_ar6: string | null;
  des_ar7: string | null;
  des_ar8: string | null;
  des_art: string;
  factor: number;
  id_art: number;
  id_cpc: number | null;
  id_ped: number | null;
  id_umedr: number;
  igv_art: number;
  itmcpc: number | null;
  itmped: number | null;
  nrocpc: string | null;
  nroitm: number;
  nroped: string | null;
  operador: string;
  pdes_art: number;
  pre_art: number;
  pu_conigv: number;
  pu_des: number;
  pu_sinigv: number;
  subtot_art: number;
  tot_art: number;
}

export interface IGuiaremisionDetalleFormState extends IGuiaRemisionDetalles {
  alias_umed: string;
  id_remision?: number | null;
  nroalm?: string | null;
  itmalm?: number | null;
}

export interface IRemisionPorCliente {
  id_remision: number;
  id_ped: number | null;
  id_ven: number;
  for_pago: number;
  serie: string;
  numero: string;
  ano: string;
  mes: string;
  rucaux: string;
  nomaux: string;
  dirent: string | null;
  ptopartida: string | null;
  ubigeo1: string | null;
  ubigeo2: string | null;
  formapago: string;
  codmon: string;
  tpocmb: number;
  porigv: string | number;
  flg_incigv: boolean;
  peso: string | number;
  bultos: number;
  fchdoc: string;
  fchtras: string;
  fch_ing: string;
  fch_anu: string | null;
  estado: string;
  flg_anu: boolean;
  glosa: string | null;

  detalles: IGuiaremisionDetalleFormState[];
}
