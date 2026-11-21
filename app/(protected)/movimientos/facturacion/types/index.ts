export interface IFacturaListado {
  ano: string;
  codmon: string;
  diraux: string | null;
  estado: string;
  factura: string;
  fch_anu: string | null;
  fch_ing: string | null;
  fchdoc: string;
  flg_anu: boolean;
  flg_incigv: boolean;
  for_pago: number | null;
  guia_remision: string;
  id_aux: number | null;
  id_cpc: number | null;
  id_ped: number | null;
  id_ven: number | null;
  nomaux: string;
  nromes: string;
  num_doc: string | null;
  pedido: string;
  porigv: number;
  rucaux: string;
  ser_doc: string;
  tpocmb: number;
  usuario: number | null;
  usuario_anu: number | null;
  usuario_ing: string;
}

export interface FacturacionCabecera {
  ano: string;
  codalm: string;
  codmon: string;
  diavto: number;
  diraux: string;
  fchcob: string | null;
  fchdoc: string;
  fchvto: string;
  flg_incigv: boolean;
  for_pago: number | null;
  guia_remision: string | null;
  id_remision: number | null;
  id_aux: number | null;
  id_cpc: number | null;
  id_ped: number | null;
  id_tipdoc: number;
  id_ven: number | null;
  impadel: number;
  impigv: number;
  impsbt: number;
  imptot: number;
  monto_a: number;
  monto_i: number;
  nomaux: string;
  nro_ped: string | null;
  nromes: string;
  num_doc: string | null;
  ocompra: string | null;
  porigv: number;
  rucaux: string;
  sdodoc: number;
  ser_doc: string;
  tipo: string; // Guia remision, pedido, libre
  tpocmb: number;
  usuario: number | null;
}

export interface FacturacionCabeceraFormState extends FacturacionCabecera {
  pedido: string;

  estado: string;
  flg_anu: boolean;
  fch_anu: string | null;
  fch_ing: string;
  usu_anu: number | null;
  usuario_anu: string | null;
  usuario_ing: string | null;
}

export interface FacturacionDetalle {
  nroitm: number;
  id_art: number;
  cod_art: string;
  des_art: string;

  id_umedr: number;

  factor: number;
  can_art: number;

  pre_art: number;
  pdes_art: number;
  pu_des: number;
  tot_art: number;

  des_ar1: string | null;
  des_ar2: string | null;
  des_ar3: string | null;
  des_ar4: string | null;
  des_ar5: string | null;
  des_ar6: string | null;
  des_ar7: string | null;
  des_ar8: string | null;

  subtot_art: number;
  igv_art: number;
  pu_conigv: number;
  pu_sinigv: number;
  operador: string;

  id_ped: number | null;
  itmped: number | null;
  id_alm: number | null;
  itmalm: number | null;
  nroped: string | null;
  nroalm: string | null;
}

export interface FacturacionDetalleFormState extends FacturacionDetalle {
  alias_umed: string;
  flg_icbper?: boolean;
  mon_icbper?: number;
}

export interface IFacturaPorCliente {
  id_cpc: number;
  id_ped: number | null;
  id_remision: number | null;
  id_tipdoc: number;
  id_ven: number | null;
  for_pago: number;
  ser_doc: string;
  num_doc: string | null;
  ano: string;
  nromes: string;
  rucaux: string;
  nomaux: string;
  diraux: string;
  codalm: string;
  codmon: string;
  tpocmb: number;
  porigv: number;
  flg_incigv: boolean;
  impsbt: number;
  impigv: number;
  imptot: number;
  impadel: number;
  monto_a: number;
  monto_i: number;
  sdodoc: number;
  diavto: number;
  fchdoc: string;
  fchvto: string;
  fchcob: string | null;
  fch_ing: string;
  fch_anu: string | null;
  estado: string;
  flg_anu: boolean;
  nro_ped: string | null;
  guia_remision: string | null;
  ocompra: string | null;
  tipo: string | null;
  formapago: string;
  pedido?: string | null;
  usuario: number | null;
  usuario_anu: number | null;

  detalles: FacturacionDetalleFormState[];
}
