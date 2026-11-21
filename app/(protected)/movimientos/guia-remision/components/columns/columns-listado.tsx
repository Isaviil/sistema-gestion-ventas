import { ColumnDef } from "@tanstack/react-table";
import { IGuiaRemisionListado } from "../../types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";

import {
  formatDateString,
  formatSerieNumero,
  truncateText,
} from "@/app/utils/dateUtils";
import { EstadoBadge } from "@/app/components/ui/status-en-listado-card";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";

export const columnsListado: ColumnDef<
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
  {
    accessorKey: "fchdoc",
    header: "Fecha",
    meta: { className: "whitespace-nowrap" },
    cell: ({ row }) => formatDateString(row.original.fchdoc, "DD-MM-YYYY"),
  },
  {
    accessorKey: "nomaux",
    header: "Cliente",
    meta: { className: "whitespace-nowrap" },
    cell: ({ row }) => truncateText(row.original.nomaux, 22),
  },
  {
    accessorKey: "pedido",
    header: "Pedido",
    meta: { className: "whitespace-nowrap" },
  },
  {
    accessorKey: "factura",
    header: "Factura",
    meta: { className: "whitespace-nowrap" },
    cell: ({ row }) => formatSerieNumero(row.original.factura),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    meta: { align: "center" },
    cell: ({ row }) => <EstadoBadge estado={row.original.estado} />,
  },
];
