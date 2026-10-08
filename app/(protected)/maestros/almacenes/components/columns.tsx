import { ColumnDef } from "@tanstack/react-table";
import { IAlmacenList } from "../types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";
import { formatDateString } from "@/app/utils/dateUtils";

export const columns: ColumnDef<typeof features, IAlmacenList, unknown>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "codalm",
    header: "Código",
    meta: { align: "center" },
  },
  {
    accessorKey: "aliasalm",
    header: "Alias",
    meta: { align: "left" },
  },
  {
    accessorKey: "distrito",
    header: "Distrito",
    meta: { align: "left" },
  },
  {
    accessorKey: "diralm",
    header: "Dirección",
    meta: { align: "left" },
  },
  {
    accessorKey: "fch_reg",
    header: "Fecha de registro",
    meta: { align: "center" },
    cell: ({ row }) => formatDateString(row.original.fch_reg, "DD-MM-YYYY"),
  },
];
