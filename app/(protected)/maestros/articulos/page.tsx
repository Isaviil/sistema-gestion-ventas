"use client";
import { useMemo, useState } from "react";
import { ProductResponse } from "./types";
import { useProducts } from "./api/list-articulos";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { columns } from "./components/columns";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DialogAddArticulo } from "./components/formulario";
import { useDeleteProduct } from "./api/[id]/delete-articulo";
import { Spinner } from "@/app/components/loading/Spinner";

const filterArticulos = (
  data: ProductResponse[],
  filtro: string,
): ProductResponse[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const codArt = item.cod_art?.toLowerCase() ?? "";
    const desArt = item.des_art?.toLowerCase() ?? "";

    return terms.every(
      (term) => codArt.includes(term) || desArt.includes(term),
    );
  });
};

export default function Articulos() {
  // Estados
  const [selectedArticulo, setSelectedArticulo] = useState<ProductResponse[]>(
    [],
  );
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openArticulo, setOpenArticulo] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);

  // Query
  const { data: dataArticulos = [], isLoading } = useProducts();

  // Filtro
  const articulosFiltrados = useMemo(
    () => filterArticulos(dataArticulos, filtro),
    [dataArticulos, filtro],
  );

  const deleteMutation = useDeleteProduct();

  // Eliminar
  const handleDelete = async () => {
    if (!selectedArticulo[0]) return;

    await deleteMutation.mutateAsync(selectedArticulo[0].id_art);
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
      {/* Modal artículo */}
      <DialogAddArticulo
        open={openArticulo}
        setOpen={setOpenArticulo}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedArticulo[0] ?? null}
      />

      {/* Modal confirmar eliminar */}
      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar artículo"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedArticulo[0]?.des_art ?? "este artículo"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Artículos
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por código, descripción..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={!selectedArticulo || selectedArticulo.length === 0}
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
            disabled={!selectedArticulo || selectedArticulo.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenArticulo(true)}
            title="Editar seleccionado"
          >
            Editar
          </Button>

          <Button
            variant="primary"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            startIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenArticulo(true)}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {articulosFiltrados.length > 0 ? (
          <DataTable
            data={articulosFiltrados}
            columns={columns}
            onRowsSelected={setSelectedArticulo}
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
              No se encontraron artículos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
