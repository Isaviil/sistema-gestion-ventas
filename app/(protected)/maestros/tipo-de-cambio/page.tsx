"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { columns } from "./components/columns";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DialogAddTipoCambio } from "./components/formulario";
import { Spinner } from "@/app/components/loading/Spinner";
import { useTipoCambio } from "./api/list-tipos-cambio";
import { useDeleteTipoCambio } from "./api/[id]/delete-tipo-cambio";
import { TipoCambio } from "./types";

const filterTipoCambio = (data: TipoCambio[], filtro: string): TipoCambio[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const fecha = item.fchcmb?.toLowerCase() ?? "";
    const compra = String(item.oficmp ?? "");
    const venta = String(item.ofivta ?? "");

    return terms.every(
      (term) =>
        fecha.includes(term) || compra.includes(term) || venta.includes(term),
    );
  });
};

export default function TiposCambio() {
  /* Estados */
  const [selectedTipoCambio, setSelectedTipoCambio] = useState<TipoCambio[]>(
    [],
  );
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openTipoCambio, setOpenTipoCambio] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);

  /* Query */
  const { data: dataTipoCambio = [], isLoading } = useTipoCambio();

  /* Filtro */
  const tiposCambioFiltrados = useMemo(
    () => filterTipoCambio(dataTipoCambio, filtro),
    [dataTipoCambio, filtro],
  );

  const deleteMutation = useDeleteTipoCambio();

  /* Eliminar */
  const handleDelete = async () => {
    if (!selectedTipoCambio[0]) return;

    await deleteMutation.mutateAsync(selectedTipoCambio[0].id_tcmb);
    setClearSelectionCounter((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div
        className="px-4 sm:px-6 py-6 max-w-4xl mx-auto border rounded-2xl shadow-xl flex items-center justify-center h-96"
        style={{
          backgroundColor: "var(--color-component-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="px-4 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto border rounded-2xl shadow-xl transition-colors duration-200"
      style={{
        backgroundColor: "var(--color-component-background)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Modal tipo de cambio */}
      <DialogAddTipoCambio
        open={openTipoCambio}
        setOpen={setOpenTipoCambio}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedTipoCambio[0] ?? null}
      />

      {/* Modal confirmar eliminar */}
      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar tipo de cambio"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedTipoCambio[0]?.fchcmb
                ? selectedTipoCambio[0].fchcmb.slice(0, 10)
                : "este tipo de cambio"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Tipos de Cambio
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por fecha, compra, venta..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={!selectedTipoCambio || selectedTipoCambio.length === 0}
            startIcon={<Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenConfirmDelete(true)}
            title="Eliminar seleccionado"
          >
            Eliminar
          </Button>

          <Button
            variant="secondary"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={!selectedTipoCambio || selectedTipoCambio.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenTipoCambio(true)}
            title="Editar seleccionado"
          >
            Editar
          </Button>

          <Button
            variant="primary"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            startIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenTipoCambio(true)}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {tiposCambioFiltrados.length > 0 ? (
          <DataTable
            data={tiposCambioFiltrados}
            columns={columns}
            onRowsSelected={setSelectedTipoCambio}
            clearSelectionTrigger={clearSelectionCounter}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed transition-colors duration-200"
            style={{
              backgroundColor: "var(--color-component-background)",
              borderColor: "var(--color-border)",
            }}
          >
            <p
              className="text-xs font-medium opacity-60"
              style={{ color: "var(--color-regular-text)" }}
            >
              No se encontraron tipos de cambio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
