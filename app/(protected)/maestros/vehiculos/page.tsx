"use client";

import { useMemo, useState } from "react";
import { Vehiculo } from "./types";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useDeleteVehiculo } from "./api/[id]/delete-vehiculo";
import { Spinner } from "@/app/components/loading/Spinner";
import { useVehiculos } from "./api/list-vehiculo";
import { columns } from "./components/columns";
import { DialogAddVehiculo } from "./components/formulario";

const filterVehiculos = (data: Vehiculo[], filtro: string): Vehiculo[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const placa = item.placa?.toLowerCase() ?? "";
    const marca = item.marca?.toLowerCase() ?? "";

    return terms.every((term) => placa.includes(term) || marca.includes(term));
  });
};

export default function Vehiculos() {
  // Estados
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo[]>([]);
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openVehiculo, setOpenVehiculo] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);

  // Query
  const { data: dataVehiculos = [], isLoading } = useVehiculos();

  // Filtro
  const vehiculosFiltrados = useMemo(
    () => filterVehiculos(dataVehiculos, filtro),
    [dataVehiculos, filtro],
  );

  const deleteMutation = useDeleteVehiculo();

  // Eliminar
  const handleDelete = async () => {
    if (!selectedVehiculo[0]) return;

    await deleteMutation.mutateAsync(selectedVehiculo[0].id_vehi);

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
      {/* Modal vehículo */}
      <DialogAddVehiculo
        open={openVehiculo}
        setOpen={setOpenVehiculo}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedVehiculo[0] ?? null}
      />

      {/* Modal confirmar eliminar */}
      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar vehículo"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedVehiculo[0]?.placa ?? "este vehículo"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Vehículos
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por placa, marca..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={!selectedVehiculo || selectedVehiculo.length === 0}
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
            disabled={!selectedVehiculo || selectedVehiculo.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenVehiculo(true)}
            title="Editar seleccionado"
          >
            Editar
          </Button>

          <Button
            variant="primary"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            startIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenVehiculo(true)}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {vehiculosFiltrados.length > 0 ? (
          <DataTable
            data={vehiculosFiltrados}
            columns={columns}
            onRowsSelected={setSelectedVehiculo}
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
              No se encontraron vehículos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
