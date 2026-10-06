export const tipoPersonaData = [
  { id: 1, descripcion: "Persona Natural" },
  { id: 2, descripcion: "Persona Jurídica" },
  { id: 3, descripcion: "Persona Extranjera" },
];

export const documentosData = [
  {
    id: "-",
    descripcion: "S/D",
    maxLength: 0,
    pattern: /^$/, // Sin documento
  },
  {
    id: "1",
    descripcion: "DNI",
    maxLength: 8,
    pattern: /^\d{8}$/, // Exactamente 8 dígitos
  },
  {
    id: "2",
    descripcion: "FFPP",
    maxLength: 12,
    pattern: /^\d{1,12}$/, // Hasta 12 dígitos
  },
  {
    id: "3",
    descripcion: "FFAA",
    maxLength: 12,
    pattern: /^\d{1,12}$/, // Hasta 12 dígitos
  },
  {
    id: "4",
    descripcion: "CE",
    maxLength: 12,
    pattern: /^[A-Za-z0-9]{1,12}$/, // Hasta 12 caracteres alfanuméricos
  },
  {
    id: "6",
    descripcion: "RUC",
    maxLength: 11,
    pattern: /^\d{11}$/, // Exactamente 11 dígitos
  },
  {
    id: "8",
    descripcion: "TAXID",
    maxLength: 20,
    pattern: /^[A-Za-z0-9-]{1,20}$/, // Hasta 20 caracteres alfanuméricos y guiones
  },
];

export const mesesData = [
  { id: 0, label: "Todos" },
  { id: 1, label: "Enero" },
  { id: 2, label: "Febrero" },
  { id: 3, label: "Marzo" },
  { id: 4, label: "Abril" },
  { id: 5, label: "Mayo" },
  { id: 6, label: "Junio" },
  { id: 7, label: "Julio" },
  { id: 8, label: "Agosto" },
  { id: 9, label: "Setiembre" },
  { id: 10, label: "Octubre" },
  { id: 11, label: "Noviembre" },
  { id: 12, label: "Diciembre" },
];

export const anioData = Array.from({ length: 50 }, (_, i) =>
  (2020 + i).toString(),
);
