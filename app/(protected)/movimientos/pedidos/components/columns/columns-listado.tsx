import { ColumnDef } from "@tanstack/react-table";
import { IPedidoListado } from "../../types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";
import { formatDateString } from "@/app/utils/dateUtils";

export const columnsListado: ColumnDef<
  typeof features,
  IPedidoListado,
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
    header: "N.º Pedido",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "fchdoc",
    header: "Fecha",
    meta: { className: "whitespace-nowrap" },
    cell: ({ row }) => formatDateString(row.original.fchdoc, "DD-MM-YYYY"),
  },
  {
    accessorKey: "rucaux",
    header: "RUC",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "nomaux",
    header: "Cliente",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "guia_remision",
    header: "G. Remisión",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "factura",
    header: "Factura",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "ocompra",
    header: "O/Compra",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "vendedor",
    header: "Vendedor",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "moneda",
    header: "Moneda",
    meta: { align: "right" },
  },
  {
    accessorKey: "imptot",
    header: "Total",
    meta: { align: "right" },
    cell: ({ row }) =>
      Number(row.original.imptot).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    meta: { align: "center" },
  },
];
