import { ColumnDef } from "@tanstack/react-table";
import { TipoCambio } from "../types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";
import { formatDateString } from "@/app/utils/dateUtils";

export const columns: ColumnDef<typeof features, TipoCambio, unknown>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "fchcmb",
    header: "Fecha",
    cell: ({ row }) => formatDateString(row.original.fchcmb, "DD-MM-YYYY"),
  },
  {
    accessorKey: "oficmp",
    header: "Compra",
    meta: { align: "right" },
  },
  {
    accessorKey: "ofivta",
    header: "Venta",
    meta: { align: "right" },
  },
];
