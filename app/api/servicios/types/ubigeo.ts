export interface IUbigeo {
  id: number;
  codigo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

export interface IUbigeoResponse {
  departamentos: {
    id_depart: string;
    departamento: string;
  }[];
  provincias: {
    id_provincia: string;
    id_depart: string;
    provincia: string;
  }[];
  distritos: {
    id_provincia: string;
    id_distrito: string;
    distrito: string;
  }[];
}
