export interface CreateTipoCambioRequest {
  fchcmb: string;
  oficmp: number | null;
  ofivta: number | null;
}

export interface TipoCambio {
  id_tcmb: string;
  fchcmb: string;
  oficmp: number;
  ofivta: number;
}
