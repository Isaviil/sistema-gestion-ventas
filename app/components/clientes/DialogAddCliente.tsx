import Button from "../ui/button";
import { DataTable } from "../ui/datatable/virtual-data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Input from "../ui/input";
import { clientesColumns } from "./clientes-columns";
import { useState } from "react";
import { useListClientes } from "@/app/(protected)/maestros/clientes/api/list-clientes";
import { Spinner } from "../loading/Spinner";
import { ICustomerResponse } from "@/app/(protected)/maestros/clientes/types";

interface DialogAddClientesProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm?: (val: ICustomerResponse[]) => void;
}

const filterClientes = (
  data: ICustomerResponse[],
  filtroCod: string,
  filtroNombre: string,
): ICustomerResponse[] => {
  if (!filtroCod && !filtroNombre) return data;

  const termsCod = filtroCod.toLowerCase().split(/\s+/).filter(Boolean);
  const termsNombre = filtroNombre.toLowerCase().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const codigo = (item.ruc_aux || "").trim().toLowerCase();
    const nombre = (item.des_aux || "").trim().toLowerCase();

    const matchCod = termsCod.every((term) => codigo.includes(term));
    const matchNombre = termsNombre.every((term) => nombre.includes(term));

    return matchCod && matchNombre;
  });
};

export default function DialogAddClientes({
  open,
  setOpen,
  onConfirm,
}: DialogAddClientesProps) {
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [queryCod, setQueryCod] = useState("");
  const [queryNombre, setQueryNombre] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<ICustomerResponse[]>(
    [],
  );

  const { data: dataClientes = [], isLoading: isLoadingClientes } =
    useListClientes();

  const handleBuscar = () => {
    setQueryCod(filtroCodigo);
    setQueryNombre(filtroNombre);
  };

  const clientesFiltrados = filterClientes(dataClientes, queryCod, queryNombre);

  const handleEnviarCliente = () => {
    onConfirm?.(selectedCliente);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="!max-w-[650px] px-5 !gap-3 py-6 border border-white/10 rounded-2xl shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--color-regular-text)] tracking-tight">
            Seleccionar Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 items-center">
          <Input
            placeholder="RUC..."
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
            className="w-28"
          />
          <Input
            placeholder="Buscar por nombre o razón social..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="flex-1"
          />
          <Button variant="primary" size="sm" onClick={handleBuscar}>
            Buscar
          </Button>
        </div>

        <div className="px-1 py-2">
          {isLoadingClientes ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : clientesFiltrados.length > 0 ? (
            <DataTable
              columns={clientesColumns}
              data={clientesFiltrados}
              cantidadMostrar={10}
              onRowsSelected={setSelectedCliente}
            />
          ) : (
            <div className="flex items-center justify-center h-32 rounded-xl border border-black/15 dark:border-[var(--color-border)] shadow-sm bg-gray-100 dark:bg-white/[0.02]">
              <p className="text-base font-semibold text-[var(--color-regular-text)]">
                No se encontraron clientes que coincidan con la búsqueda.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="brandSubtle"
            className="h-10 px-4"
            onClick={() => {
              setFiltroCodigo("");
              setFiltroNombre("");
              setQueryCod("");
              setQueryNombre("");
              setOpen(false);
            }}
          >
            Cerrar
          </Button>

          <Button
            variant="primary"
            className="h-10 px-4"
            onClick={handleEnviarCliente}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
