"use client";
import { useMemo, useState } from "react";
import { PaymentMethodResponse } from "./types";
import { usePaymentMethods } from "./api/list-formas-pago";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { columns } from "./components/columns";
import Input from "@/app/components/ui/input";
import Button from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/confirm-dialog"; // Ajusta la ruta a tu archivo
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DialogAddFormaPago } from "./components/formulario";
import { useDeleteFormaPago } from "./api/[id]/delete-forma-pago";
import { Spinner } from "@/app/components/loading/Spinner";

const filterFormaDePagos = (
  data: PaymentMethodResponse[],
  filtro: string,
): PaymentMethodResponse[] => {
  if (!filtro.trim()) return data;

  const terms = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const formaPago = item.forma_pago?.toLowerCase() ?? "";
    const codigo = item.codigo?.toLowerCase() ?? "";

    return terms.every(
      (term) => formaPago.includes(term) || codigo.includes(term),
    );
  });
};

export default function FormaDePago() {
  // Estados
  const [selectedPago, setSelectedPago] = useState<PaymentMethodResponse[]>([]);
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [openFormaDePago, setOpenFormaDePago] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);

  // Query
  const { data: dataFormaPagos = [], isLoading } = usePaymentMethods();

  // Filtro
  const pagosFiltrados = useMemo(
    () => filterFormaDePagos(dataFormaPagos, filtro),
    [dataFormaPagos, filtro],
  );

  const deleteMutation = useDeleteFormaPago();

  // Eliminar
  const handleDelete = async () => {
    if (!selectedPago[0]) return;

    await deleteMutation.mutateAsync(selectedPago[0].for_pago);
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
      {/* Modal forma de pago */}
      <DialogAddFormaPago
        open={openFormaDePago}
        setOpen={setOpenFormaDePago}
        setClearSelectionCounter={setClearSelectionCounter}
        data={selectedPago[0] ?? null}
      />

      {/* Modal confirmar eliminar */}
      <ConfirmDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={() => {
          void handleDelete();
        }}
        title="Eliminar forma de pago"
        description={
          <>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong className="font-semibold text-red-600 dark:text-red-400">
              {selectedPago[0]?.forma_pago ?? "esta forma de pago"}
            </strong>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />

      <div className="space-y-1">
        <h1 className="text-base sm:text-xl font-bold">
          Administración de Formas de Pago
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por nombre, código..."
          />
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Button
            variant="danger"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            disabled={!selectedPago || selectedPago.length === 0}
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
            disabled={!selectedPago || selectedPago.length === 0}
            startIcon={<Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenFormaDePago(true)}
            title="Editar seleccionado"
          >
            Editar
          </Button>

          <Button
            variant="primary"
            size="xs"
            className="sm:text-sm sm:px-3 sm:py-1.5"
            startIcon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setOpenFormaDePago(true)}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {pagosFiltrados.length > 0 ? (
          <DataTable
            data={pagosFiltrados}
            columns={columns}
            onRowsSelected={setSelectedPago}
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
              No se encontraron formas de pago.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
