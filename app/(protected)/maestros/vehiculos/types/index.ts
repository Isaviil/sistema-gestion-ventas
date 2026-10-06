export interface Vehiculo {
  id_vehi: number;
  placa: string;
  marca: string;
  certificado: string;
}

export interface CreateVehiculoRequest {
  placa: string;
  marca: string;
  certificado?: string | null;
}
