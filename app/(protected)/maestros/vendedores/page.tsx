"use client";
import { useMemo, useState } from "react";
import { Vendedor } from "./types";
import { useVendedores } from "./api/list-vendedores";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { columns } from "./components/columns";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DialogAddVendedor } from "./components/formulario";
import { useDeleteVendedor } from "./api/[id]/delete-vendedor";
import { Spinner } from "@/app/components/loading/Spinner";

const filterVendedores = (data: Vendedor[], filtro: string): Vendedor[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const documento = item.ndoc_ide?.toLowerCase() ?? "";
    const nombre = [item.nom_aux, item.ape_aux, item.ape_mat]
      .join(" ")
      .toLowerCase();
    const telefono = item.cel_job?.toLowerCase() ?? "";
    const correo = item.email_job?.toLowerCase() ?? "";

    return terms.every(
      (term) =>
        documento.includes(term) ||
        nombre.includes(term) ||
        telefono.includes(term) ||
        correo.includes(term),
    );
  });
};

export default function Vendedores() {
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor[]>([]);
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openVendedor, setOpenVendedor] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);

  const { data: dataVendedores = [], isLoading } = useVendedores();

  const vendedoresFiltrados = useMemo(
    () => filterVendedores(dataVendedores, filtro),
    [dataVendedores, filtro],
  );

  const deleteMutation = useDeleteVendedor();

  const handleDelete = async () => {
    if (!selectedVendedor[0]) return;

    await deleteMutation.mutateAsync(selectedVendedor[0].id_aux);

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
      <DialogAddVendedor
        open={openVendedor}
        setOpen={setOpenVendedor}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedVendedor[0] ?? null}
      />

      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar vendedor"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedVendedor[0]
                ? `${selectedVendedor[0].nom_aux} ${selectedVendedor[0].ape_aux}`
                : "este vendedor"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Vendedores
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por documento, nombre..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={selectedVendedor.length === 0}
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
            disabled={selectedVendedor.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenVendedor(true)}
            title="Editar seleccionado"
          >
            Editar
          </Button>

          <Button
            variant="primary"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            startIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenVendedor(true)}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {vendedoresFiltrados.length > 0 ? (
          <DataTable
            data={vendedoresFiltrados}
            columns={columns}
            onRowsSelected={setSelectedVendedor}
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
              No se encontraron vendedores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
