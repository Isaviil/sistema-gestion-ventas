"use client";

import { useMemo, useState } from "react";
import { TipoDocumento } from "./types";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Spinner } from "@/app/components/loading/Spinner";
import { useTiposDocumento } from "./api/list-tipo-docs";
import { useDeleteTipoDocumento } from "./api/[id]/delete-tipo-doc";
import { columns } from "./components/columsn";
import { DialogAddTipoDocumento } from "./components/formulario";

const filterTiposDocumento = (
  data: TipoDocumento[],
  filtro: string,
): TipoDocumento[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const abreviatura = item.dcor_tdoc?.toLowerCase() ?? "";
    const nombre = item.dlar_tdoc?.toLowerCase() ?? "";

    return terms.every(
      (term) => abreviatura.includes(term) || nombre.includes(term),
    );
  });
};

export default function TiposDocumento() {
  const [selectedTipoDocumento, setSelectedTipoDocumento] = useState<
    TipoDocumento[]
  >([]);
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openTipoDocumento, setOpenTipoDocumento] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);

  const { data: dataTiposDocumento = [], isLoading } = useTiposDocumento();

  const tiposDocumentoFiltrados = useMemo(
    () => filterTiposDocumento(dataTiposDocumento, filtro),
    [dataTiposDocumento, filtro],
  );

  const deleteMutation = useDeleteTipoDocumento();

  const handleDelete = async () => {
    if (!selectedTipoDocumento[0]) return;

    await deleteMutation.mutateAsync(selectedTipoDocumento[0].id_tipdoc);

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
      <DialogAddTipoDocumento
        open={openTipoDocumento}
        setOpen={setOpenTipoDocumento}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedTipoDocumento[0] ?? null}
      />

      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar tipo de documento"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedTipoDocumento[0]?.dlar_tdoc ?? "este tipo de documento"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Tipos de Documento
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por abreviatura, nombre..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={selectedTipoDocumento.length === 0}
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
            disabled={selectedTipoDocumento.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenTipoDocumento(true)}
            title="Editar seleccionado"
          >
            Editar
          </Button>

          <Button
            variant="primary"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            startIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenTipoDocumento(true)}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {tiposDocumentoFiltrados.length > 0 ? (
          <DataTable
            data={tiposDocumentoFiltrados}
            columns={columns}
            onRowsSelected={setSelectedTipoDocumento}
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
              No se encontraron tipos de documento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
