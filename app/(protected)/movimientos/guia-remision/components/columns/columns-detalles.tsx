import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import { formatPrice } from "@/app/utils/numberUtils";
import { ColumnDef } from "@tanstack/react-table";
import { IGuiaRemisionDetalles } from "../../types";

export const columnsDetalles: ColumnDef<
  typeof features,
  IGuiaRemisionDetalles,
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
];
