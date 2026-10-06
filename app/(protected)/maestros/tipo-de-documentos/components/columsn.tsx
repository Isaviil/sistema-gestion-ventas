import { ColumnDef } from "@tanstack/react-table";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";
import { TipoDocumento } from "../types";

export const columns: ColumnDef<typeof features, TipoDocumento, unknown>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "dcor_tdoc",
    header: "Abreviatura",
    meta: { align: "center" },
  },
  {
    accessorKey: "dlar_tdoc",
    header: "Nombre documento",
    meta: { align: "left" },
  },
];
