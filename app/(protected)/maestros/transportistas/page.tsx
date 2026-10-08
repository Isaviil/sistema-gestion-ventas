"use client";
import { useMemo, useState } from "react";
import { IChofer } from "./types";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { columns } from "./components/columns";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Spinner } from "@/app/components/loading/Spinner";
import { DialogAddTransportista } from "./components/formulario";
import { useTransportistas } from "./api/list-transportistas";
import { useDeleteTransportista } from "./api/[id]/delete-transportista";

const filterTransportistas = (data: IChofer[], filtro: string): IChofer[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const brevete = item.brevete?.toLowerCase() ?? "";
    const dni = item.dni?.toLowerCase() ?? "";
    const nombre = item.nombre?.toLowerCase() ?? "";

    return terms.every(
      (term) =>
        brevete.includes(term) || dni.includes(term) || nombre.includes(term),
    );
  });
};

export default function Transportistas() {
  // Estados
  const [selectedTransportista, setSelectedTransportista] = useState<IChofer[]>(
    [],
  );
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openTransportistaModal, setOpenTransportistaModal] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  // Query
  const { data: dataTransportistas = [], isLoading } = useTransportistas();

  // Filtrado
  const transportistasFiltrados = useMemo(
    () => filterTransportistas(dataTransportistas, filtro),
    [dataTransportistas, filtro],
  );

  // Mutación
  const deleteMutation = useDeleteTransportista();

  // Eliminar
  const handleDelete = async () => {
    if (!selectedTransportista[0]) return;

    await deleteMutation.mutateAsync(selectedTransportista[0].id_chof);
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
      <DialogAddTransportista
        open={openTransportistaModal}
        setOpen={setOpenTransportistaModal}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedTransportista[0] ?? null}
      />

      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar transportista"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedTransportista[0]?.nombre ?? "este transportista"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Transportistas
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por brevete, DNI, nombre..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={selectedTransportista.length === 0}
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
            disabled={selectedTransportista.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenTransportistaModal(true)}
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
              setSelectedTransportista([]);
              setOpenTransportistaModal(true);
            }}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {transportistasFiltrados.length > 0 ? (
          <DataTable
            data={transportistasFiltrados}
            columns={columns}
            onRowsSelected={setSelectedTransportista}
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
              No se encontraron transportistas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
