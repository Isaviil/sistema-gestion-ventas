import { ColumnDef } from "@tanstack/react-table";
import { IChofer } from "../types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";

export const columns: ColumnDef<typeof features, IChofer, unknown>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "brevete",
    header: "Brevete",
    meta: { align: "left" },
  },
  {
    accessorKey: "dni",
    header: "DNI",
    meta: { align: "center" },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    meta: { align: "left" },
  },
];
