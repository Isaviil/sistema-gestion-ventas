import { ColumnDef } from "@tanstack/react-table";
import { IGuiaRemisionListado } from "@/app/(protected)/movimientos/guia-remision/types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import { truncateText } from "@/app/utils/dateUtils";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";
import { IPedidoPorCliente } from "@/app/(protected)/movimientos/pedidos/types";
import { IFacturaPorCliente } from "@/app/(protected)/movimientos/facturacion/types"; // ajusta la ruta si está en otro archivo

type ModuloBase = {
  rucaux: string | null;
  nomaux: string | null;
  formapago: string | null;
  codmon: string | null;
};

const getCommonColumns = <T extends ModuloBase>(): ColumnDef<
  typeof features,
  T,
  unknown
>[] => [
  {
    accessorKey: "rucaux",
    meta: { className: "whitespace-nowrap" },
    header: "RUC",
  },
  {
    accessorKey: "nomaux",
    meta: { className: "whitespace-nowrap" },
    header: "Cliente",
    cell: ({ row }) => truncateText(row.original.nomaux ?? "", 22),
  },
  {
    accessorKey: "codmon",
    meta: { className: "whitespace-nowrap" },
    header: "Moneda",
    cell: ({ row }) => (row.original.codmon === "1" ? "S" : "D"),
  },
  {
    accessorKey: "tpocmb",
    meta: { className: "whitespace-nowrap" },
    header: "T. cambio",
  },
];

export const columnsPedidos: ColumnDef<
  typeof features,
  IPedidoPorCliente,
  unknown
>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "nrodoc",
    header: "Número",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "imptot",
    header: "Total",
    meta: { className: "whitespace-nowrap" },
  },
  ...getCommonColumns<IPedidoPorCliente>(),
];

export const columnsRemisiones: ColumnDef<
  typeof features,
  IGuiaRemisionListado,
  unknown
>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "numero",
    header: "Número",
    meta: { className: "whitespace-nowrap" },
  },
  ...getCommonColumns<IGuiaRemisionListado>(),
];

export const columnsFacturas: ColumnDef<
  typeof features,
  IFacturaPorCliente,
  unknown
>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    id: "numero_documento",
    header: "Número",
    meta: { className: "whitespace-nowrap" },
    cell: ({ row }) => {
      const { ser_doc, num_doc } = row.original;
      return num_doc ? `${ser_doc}-${num_doc}` : ser_doc;
    },
  },
  {
    accessorKey: "imptot",
    header: "Total",
    meta: { className: "whitespace-nowrap" },
  },
  ...getCommonColumns<IFacturaPorCliente>(),
];

export const columnsSegunModulo = {
  pedidos: columnsPedidos,
  remisiones: columnsRemisiones,
  facturas: columnsFacturas,
};
