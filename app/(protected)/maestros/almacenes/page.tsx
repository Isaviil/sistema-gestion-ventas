"use client";

import { useMemo, useState } from "react";
import { IAlmacenList } from "./types";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { columns } from "./components/columns";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Spinner } from "@/app/components/loading/Spinner";
import { useDeleteAlmacen } from "./api/[id]/delete-almacen";
import { DialogAddAlmacen } from "./components/formulario";
import { useAlmacenes } from "./api/list-almacenes";

const filterAlmacenes = (
  data: IAlmacenList[],
  filtro: string,
): IAlmacenList[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const aliasalm = item.aliasalm?.toLowerCase() ?? "";
    const desalm = item.desalm?.toLowerCase() ?? "";
    const distrito = item.distrito?.toLowerCase() ?? "";
    const diralm = item.diralm?.toLowerCase() ?? "";

    return terms.every(
      (term) =>
        aliasalm.includes(term) ||
        desalm.includes(term) ||
        distrito.includes(term) ||
        diralm.includes(term),
    );
  });
};

export default function Almacenes() {
  // Estados
  const [selectedAlmacen, setSelectedAlmacen] = useState<IAlmacenList[]>([]);
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openAlmacenModal, setOpenAlmacenModal] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);

  // Query
  const { data: dataAlmacenes = [], isLoading } = useAlmacenes();

  // Convierte "2026-10-08T21:38:03.756Z" en "2026-10-08"
  const dataAlmacenesFechaFix = dataAlmacenes.map((item) => ({
    ...item,
    fch_reg: item.fch_reg.split("T")[0],
  }));

  // Recibe la data con el fix en la fecha
  const almacenesFiltrados = useMemo(
    () => filterAlmacenes(dataAlmacenesFechaFix, filtro),
    [dataAlmacenesFechaFix, filtro],
  );

  // Mutación
  const deleteMutation = useDeleteAlmacen();

  // Eliminar
  const handleDelete = async () => {
    if (!selectedAlmacen[0]) return;

    await deleteMutation.mutateAsync(selectedAlmacen[0].codalm);
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
      <DialogAddAlmacen
        open={openAlmacenModal}
        setOpen={setOpenAlmacenModal}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedAlmacen[0] ?? null}
      />

      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar almacén"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedAlmacen[0]?.desalm ?? "este almacén"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Almacenes
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por alias, descripción, distrito..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={!selectedAlmacen || selectedAlmacen.length === 0}
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
            disabled={!selectedAlmacen || selectedAlmacen.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenAlmacenModal(true)}
            title="Editar seleccionado"
          >
            Editar
          </Button>

          <Button
            variant="primary"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            startIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => {
              setSelectedAlmacen([]);
              setOpenAlmacenModal(true);
            }}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {almacenesFiltrados.length > 0 ? (
          <DataTable
            data={almacenesFiltrados}
            columns={columns}
            onRowsSelected={setSelectedAlmacen}
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
              No se encontraron almacenes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
