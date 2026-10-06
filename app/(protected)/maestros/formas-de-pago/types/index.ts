export interface CreatePaymentMethodRequest {
  forma_pago: string;
  codigo?: string | null;
  dias: number;
}

export interface PaymentMethodResponse {
  for_pago: number;
  forma_pago: string;
  codigo: string | null;
  dias: number;
  flg_activo: boolean;
}