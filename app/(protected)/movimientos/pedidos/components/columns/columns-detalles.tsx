import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import { formatPrice } from "@/app/utils/numberUtils";
import { ColumnDef } from "@tanstack/react-table";
import { IPedidoDetalleFormState } from "../../types";

export const columnsDetalles: ColumnDef<
  typeof features,
  IPedidoDetalleFormState,
  unknown
>[] = [
  {
    id: "selection",
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "nroitm",
    header: "N°",
    meta: { align: "center" },
  },
  {
    accessorKey: "cod_art",
    header: "Código",
  },
  {
    accessorKey: "des_art",
    header: "Descripción",
  },
  {
    accessorKey: "alias_umed",
    header: "Und",
    meta: { align: "center" },
  },
  {
    accessorKey: "can_art",
    header: "Cant",
    meta: { align: "right" },
    cell: ({ row }) => formatPrice(row.original.can_art, 3),
  },
  {
    accessorKey: "pre_art",
    header: "Precio",
    meta: { align: "right" },
    cell: ({ row }) => formatPrice(row.original.pre_art, 6),
  },
  {
    accessorKey: "pdes_art",
    header: "% Dscto",
    meta: { align: "right" },
    cell: ({ row }) =>
      row.original.pdes_art > 0 ? formatPrice(row.original.pdes_art, 4) : "",
  },
  {
    accessorKey: "pu_des",
    header: "PU. Des",
    meta: { align: "right" },
    cell: ({ row }) => formatPrice(row.original.pu_des, 6),
  },
  {
    accessorKey: "tot_art",
    header: "Total",
    meta: { align: "right" },
    cell: ({ row }) => formatPrice(row.original.tot_art, 2),
  },
];
