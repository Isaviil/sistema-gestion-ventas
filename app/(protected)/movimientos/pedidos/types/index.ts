export interface IPedidoListado {
  ano: string;
  codmon: string;
  cotizacion: string | null;
  diraux: string;
  estado: string;
  factura: string;
  fch_anu: string | null;
  fch_aprob: string | null;
  fch_ate: string | null;
  fch_ent: string;
  fch_ing: string;
  fchdoc: string;
  flg_anu: boolean;
  flg_aprob: boolean;
  flg_incigv: boolean;
  for_pago: number;
  formapago: string;
  glosa: string | null;
  guia_remision: string | null;
  id_clie: number;
  id_cot: number | null;
  id_ped: number;
  id_ven: number;
  impbto: string;
  impigv: string;
  imptot: string;
  mes: string;
  nomaux: string;
  nrodoc: string;
  ocompra: string | null;
  porigv: string;
  rucaux: string;
  tpocmb: string;
  usuario: number;
  usuario_anu: number | null;
  usuario_aprob: number | null;
  usuario_cie: number | null;
  vendedor: string;
}

export interface IPedidoCabeceraForm {
  ano: string;
  codmon: string;
  diraux: string;
  fch_ent: string;
  fchdoc: string;
  flg_incigv: boolean;
  for_pago: number | null;
  glosa: string | null;
  id_clie: number | null;
  id_cot: number | null;
  id_ven: number | null;
  impbto: number;
  impigv: number;
  imptot: number;
  mes: string;
  nomaux: string;
  ocompra: string | null;
  porigv: number;
  rucaux: string;
  tpocmb: number;
  usuario: number | null;
}

export interface IPedidoCabeceraFormState extends IPedidoCabeceraForm {
  nrodoc: string | null;
  factura: string;
  guia_remision: string;
}

export interface IPedidoDetalleForm {
  alias_umed: string;
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
  id_umedr: number;
  igv_art: number;
  nroitm: number;
  operador: string;
  pdes_art: number;
  pre_art: number;
  pu_conigv: number;
  pu_des: number;
  pu_sinigv: number;
  subtot_art: number;
  tot_art: number;
}

export interface IPedidoDetalleFormState extends IPedidoDetalleForm {
  cantidad?: number;
  can_pendiente?: number;
  id_ped?: number | null;
}

export interface IPedidoCabeceraPorID {
  ano: string;
  codmon: string;
  cotizacion: string | null;
  diraux: string;
  estado: string;
  factura: string;
  fch_anu: string | null;
  fch_aprob: string | null;
  fch_ate: string | null;
  fch_ent: string;
  fch_ing: string;
  fchdoc: string;
  flg_anu: boolean;
  flg_aprob: boolean;
  flg_incigv: boolean;
  for_pago: number;
  formapago: string;
  glosa: string | null;
  guia_remision: string;
  id_clie: number;
  id_ped: number;
  id_ven: number;
  imptot: number;
  mes: string;
  moneda: string;
  nomaux: string;
  nrodoc: string | null;
  ocompra: string | null;
  rucaux: string;
  tpocmb: number;
  usu_anu: number | null;
  usu_aprob: number | null;
  usu_cie: number | null;
  usuario: number;
  usuario_anu: string | null;
  usuario_aprob: string | null;
  usuario_cie: string | null;
  usuario_ing: string;
  vendedor: string;
}

export interface IPedidoDetallePorID {
  alias_umed: string;
  can_art: number;
  can_ate: number;
  can_pend: number;
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
  id_ped: number;
  id_umedr: number;
  igv_art: number;
  nroitm: number;
  operador: string;
  pdes_art: number;
  pre_art: number;
  pu_conigv: number;
  pu_des: number;
  pu_sinigv: number;
  subtot_art: number;
  tot_art: number;
  umedida: string;
}

// Exporta un pedido usando idaux
export interface IPedidoPorCliente {
  id_ped: number;
  nrodoc: string;
  rucaux: string;
  nomaux: string;
  formapago: string;
  codmon: string;
  imptot: number;
  tpocmb: number;
  id_ven: number;
  for_pago: number;
  glosa: string | null;
  fchdoc: string;
  detalles: IPedidoDetalleFormState[];
}
