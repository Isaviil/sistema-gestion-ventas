import { ICustomerResponse } from "@/app/(protected)/maestros/clientes/types"; // Ajusta la ruta según tu estructura
import DataTableRowSelectionCell from "../ui/datatable/datatable-row-selection-header-cell";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import { ColumnDef } from "@tanstack/react-table";

export const clientesColumns: ColumnDef<
  typeof features,
  ICustomerResponse,
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
    accessorKey: "ruc_aux",
    header: "RUC / Código",
    meta: { align: "center" },
  },
  {
    accessorKey: "des_aux",
    header: "Nombre o Razón Social",
    meta: { align: "left" },
  },
  {
    accessorKey: "distrito",
    header: "Distrito",
    meta: { align: "left" },
  },
];
