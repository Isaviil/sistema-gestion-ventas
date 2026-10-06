import { ColumnDef } from '@tanstack/react-table';
import { PaymentMethodResponse } from '../types';
import { features } from '@/app/components/ui/datatable/virtual-data-table';
import DataTableRowSelectionCell from '@/app/components/ui/datatable/datatable-row-selection-header-cell';

export const columns: ColumnDef<
  typeof features,
  PaymentMethodResponse,
  unknown
>[] = [
  {
    id: 'selection',
    meta: { align: 'center' },
    cell: ({ row, table }) => (
      <DataTableRowSelectionCell
        table={table}
        row={row}
        maxSelection={1}
      />
    ),
  },
  {
    accessorKey: 'forma_pago',
    header: 'Nombre',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'codigo',
    header: 'Código',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'dias',
    header: 'Días',
    meta: { align: 'center' },
  },
];