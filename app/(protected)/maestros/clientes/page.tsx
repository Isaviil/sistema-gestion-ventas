"use client";

import { useMemo, useState } from "react";
import { ICustomerResponse } from "./types";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { columns } from "./components/columns";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Spinner } from "@/app/components/loading/Spinner";
import { useDeleteCliente } from "./api/[id]/delete-clientes";
import { DialogAddCliente } from "./components/formulario";
import { useListClientes } from "./api/list-clientes";

const filterClientes = (
  data: ICustomerResponse[],
  filtro: string,
): ICustomerResponse[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const desAux = item.des_aux?.toLowerCase() ?? "";
    const rucAux = item.ruc_aux?.toLowerCase() ?? "";
    const telefono = item.telefono?.toLowerCase() ?? "";

    return terms.every(
      (term) =>
        desAux.includes(term) ||
        rucAux.includes(term) ||
        telefono.includes(term),
    );
  });
};

export default function ClientesPage() {
  // Estados
  const [selectedCliente, setSelectedCliente] = useState<ICustomerResponse[]>(
    [],
  );
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openClienteModal, setOpenClienteModal] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);

  // Query
  const { data: dataClientes = [], isLoading } = useListClientes();

  // Filtro
  const clientesFiltrados = useMemo(
    () => filterClientes(dataClientes, filtro),
    [dataClientes, filtro],
  );

  const deleteMutation = useDeleteCliente();

  // Eliminar
  const handleDelete = async () => {
    if (!selectedCliente[0]) return;

    await deleteMutation.mutateAsync(selectedCliente[0].id_aux);
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
      <DialogAddCliente
        open={openClienteModal}
        setOpen={setOpenClienteModal}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedCliente[0] ?? null}
      />

      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar cliente"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedCliente[0]?.des_aux ?? "este cliente"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Clientes
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por RUC, razón social..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={!selectedCliente || selectedCliente.length === 0}
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
            disabled={!selectedCliente || selectedCliente.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenClienteModal(true)}
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
              setSelectedCliente([]);
              setOpenClienteModal(true);
            }}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {clientesFiltrados.length > 0 ? (
          <DataTable
            data={clientesFiltrados}
            columns={columns}
            onRowsSelected={setSelectedCliente}
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
              No se encontraron clientes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
