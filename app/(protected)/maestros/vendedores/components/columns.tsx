import { ColumnDef } from "@tanstack/react-table";
import { Vendedor } from "../types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";

export const columns: ColumnDef<typeof features, Vendedor, unknown>[] = [
  {
    id: "selection",
    meta: { align: "center" },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
    ),
  },
  {
    accessorKey: "ndoc_ide",
    header: "Documento",
    meta: { align: "center" },
  },
  {
    id: "nombre",
    header: "Nombre completo",
    meta: { align: "left" },
    cell: ({ row }) => {
      const { nom_aux, ape_aux, ape_mat } = row.original;

      return `${nom_aux} ${ape_aux} ${ape_mat}`;
    },
  },
  {
    accessorKey: "cel_job",
    header: "Teléfono",
    meta: { align: "center" },
  },
  {
    accessorKey: "email_job",
    header: "Correo",
    meta: { align: "left" },
  },
];
