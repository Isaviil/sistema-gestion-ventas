export interface IChofer {
  id_chof: number;
  brevete: string;
  dni: string;
  nombre: string;
}

export interface CreateChoferRequest {
  brevete: string;
  dni: string;
  nombre: string;
}
