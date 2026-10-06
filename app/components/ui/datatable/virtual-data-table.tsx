/* eslint-disable react-hooks/incompatible-library */
"use client";

import { cn } from "@/app/lib/utils";
import {
  flexRender,
  rowSelectionFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<typeof features, TData, unknown>[];
  data: TData[];
  disable?: boolean;
  height?: number;
  cantidadMostrar?: number;
  onRowsSelected?: (rows: TData[]) => void;
  clearSelectionTrigger?: number;
  maxSelection?: number;
  estimatedRowHeight?: number;
  clickable?: boolean;
  getRowId?: (row: TData, index: number) => string;
  selectedRowIds?: string[];
  onDoubleClick?: (row: TData) => void;
}

export const features = tableFeatures({
  rowSelectionFeature,
});

export function DataTable<TData extends RowData>({
  columns,
  data,
  disable = false,
  height = 400,
  cantidadMostrar,
  onRowsSelected,
  clearSelectionTrigger,
  maxSelection = 1,
  estimatedRowHeight = 36,
  clickable = true,
  getRowId,
  selectedRowIds,
  onDoubleClick,
}: DataTableProps<TData>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const onRowsSelectedRef = useRef(onRowsSelected);
  useEffect(() => {
    onRowsSelectedRef.current = onRowsSelected;
  }, [onRowsSelected]);

  const getRowIdRef = useRef(getRowId);
  useEffect(() => {
    getRowIdRef.current = getRowId;
  }, [getRowId]);

  const table = useTable({
    features,
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: !disable,
    enableMultiRowSelection: maxSelection > 1,
    onRowSelectionChange: setRowSelection,
    getRowId,
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  const visibleHeight = useMemo(() => {
    if (!cantidadMostrar) return height;
    return Math.min(height, cantidadMostrar * estimatedRowHeight);
  }, [cantidadMostrar, height, estimatedRowHeight]);

  useEffect(() => {
    if (clearSelectionTrigger === undefined) return;
    setRowSelection({});
  }, [clearSelectionTrigger]);

  useEffect(() => {
    if (!onRowsSelectedRef.current) return;

    const currentData = dataRef.current;
    const selectedRows = currentData.filter((row, index) => {
      const id = getRowIdRef.current?.(row, index) ?? String(index);
      return rowSelection[id];
    });

    onRowsSelectedRef.current(selectedRows);
  }, [rowSelection]);

  useEffect(() => {
    if (!selectedRowIds) return;

    const selection: RowSelectionState = {};
    selectedRowIds.forEach((id) => {
      selection[id] = true;
    });

    setRowSelection(selection);
  }, [selectedRowIds]);

  return (
    <div
      className="w-full rounded-xl overflow-hidden border shadow-lg transition-colors duration-200"
      style={{
        backgroundColor: "var(--color-component-background)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="w-full overflow-x-auto">
        <div
          ref={scrollRef}
          className="relative overflow-y-auto custom-scrollbar"
          style={{
            height: visibleHeight,
          }}
        >
          <table className="w-full border-collapse text-xs bg-transparent">
            <thead
              className="sticky top-0 z-20 transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-table-header-solid)",
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b"
                  style={{
                    borderColor: "var(--color-border)",
                  }}
                >
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as
                      | {
                          align?: "left" | "center" | "right";
                          className?: string;
                        }
                      | undefined;

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "py-3 px-3 text-xs font-semibold tracking-wide text-center",
                          meta?.className,
                        )}
                        style={{
                          color: "var(--color-regular-text)",
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {virtualRows.length > 0 && virtualRows[0].start > 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ height: virtualRows[0].start }}
                  />
                </tr>
              )}

              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                const isSelected = row.getIsSelected();

                return (
                  <tr
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    onClick={(event) => {
                      if (disable || !clickable) return;

                      if (
                        (event.target as HTMLElement).closest(
                          "button,input,label",
                        )
                      ) {
                        return;
                      }

                      row.toggleSelected();
                    }}
                    onDoubleClick={() => {
                      if (disable || !clickable) return;
                      onDoubleClick?.(row.original);
                    }}
                    className={cn(
                      "border-b transition-colors",
                      clickable &&
                        !disable &&
                        "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5",
                    )}
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: isSelected
                        ? "var(--color-background-primary)"
                        : "transparent",
                    }}
                  >
                    {row.getAllCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | {
                            align?: "left" | "center" | "right";
                            className?: string;
                          }
                        | undefined;

                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            "py-2.5 px-3 text-xs font-normal",
                            meta?.align === "right"
                              ? "text-right"
                              : meta?.align === "center"
                                ? "text-center"
                                : "text-left",
                            meta?.className,
                          )}
                          style={{
                            color: "var(--color-regular-text)",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {virtualRows.length > 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      height:
                        totalHeight -
                        (virtualRows[virtualRows.length - 1]?.end ?? 0),
                    }}
                  />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
