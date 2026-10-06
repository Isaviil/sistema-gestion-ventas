import { ColumnDef } from "@tanstack/react-table";
import { ICustomerResponse } from "../types";
import { features } from "@/app/components/ui/datatable/virtual-data-table";
import DataTableRowSelectionCell from "@/app/components/ui/datatable/datatable-row-selection-header-cell";

export const columns: ColumnDef<typeof features, ICustomerResponse, unknown>[] =
  [
    {
      id: "selection",
      meta: { align: "center" },
      cell: ({ row, table }) => (
        <DataTableRowSelectionCell table={table} row={row} maxSelection={1} />
      ),
    },
    {
      accessorKey: "ruc_aux",
      header: "RUC",
      cell: ({ row }) => row.original.ruc_aux || "-",
    },
    {
      accessorKey: "des_aux",
      header: "Nombre/Razon Social",
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => row.original.telefono || "-",
    },
    {
      accessorKey: "vendedor",
      header: "Vendedor",
      cell: ({ row }) => row.original.vendedor || "-",
    },
  ];
