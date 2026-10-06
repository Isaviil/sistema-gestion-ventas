import { Row, RowData, Table } from '@tanstack/react-table';
import { Checkbox } from '../checkbox';
import { features } from './virtual-data-table';

interface DataTableRowSelectionCellProps<TData extends RowData> {
  row: Row<typeof features, TData>;
  table: Table<typeof features, TData>;
  maxSelection?: number | 'unlimited';
  disabled?: boolean;
}

export default function DataTableRowSelectionCell<
  TData extends RowData
>({
  row,
  table,
  maxSelection,
  disabled = false,
}: DataTableRowSelectionCellProps<TData>) {
  const selectedCount = table.getSelectedRowModel().rows.length;

  // Solo deshabilitar si hay un límite numérico y se alcanzó ese límite
  const isDisabled =
    disabled ||
    (typeof maxSelection === 'number' &&
      maxSelection > 1 &&
      selectedCount >= maxSelection &&
      !row.getIsSelected());

  const handleCheckedChange = (value: boolean) => {
    if (disabled) return;
    if (maxSelection === 1) {
      // Comportamiento de selección única
      table.toggleAllRowsSelected(false);
      row.toggleSelected(value);
    } else {
      // Comportamiento para selección múltiple (con o sin límite)
      row.toggleSelected(value);
    }
  };

  return (
    <Checkbox
      checked={row.getIsSelected()}
      disabled={isDisabled}
      onCheckedChange={(value) => handleCheckedChange(!!value)}
      aria-label="Seleccionar fila"
    />
  );
}
