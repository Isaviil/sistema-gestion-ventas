import { ProductResponse } from "@/app/(protected)/maestros/articulos/types";
import DataTableRowSelectionCell from "../ui/datatable/datatable-row-selection-header-cell";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import { ColumnDef } from "@tanstack/react-table";

export const articulosColumns: ColumnDef<
  typeof features,
  ProductResponse,
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
    accessorKey: "cod_art",
    header: "Código",
    meta: { align: "center" },
  },
  {
    accessorKey: "des_art",
    header: "Descripción",
    meta: { align: "left" },
  },
  {
    accessorKey: "stkact",
    header: "Stock",
    meta: { align: "right" },
  },
  {
    accessorKey: "pre_art",
    header: "Precio",
    meta: { align: "right" },
  },
];
