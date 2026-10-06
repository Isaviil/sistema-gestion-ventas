import { ColumnDef } from "@tanstack/react-table";
import { Vehiculo } from "../types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";

export const columns: ColumnDef<typeof features, Vehiculo, unknown>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "placa",
    header: "Placa",
    meta: { align: "center" },
  },
  {
    accessorKey: "marca",
    header: "Marca",
    meta: { align: "left" },
  },
  {
    accessorKey: "certificado",
    header: "Certificado",
    meta: { align: "left" },
  },
];
