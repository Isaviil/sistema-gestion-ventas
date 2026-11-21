import Button from "../ui/button";
import { DataTable } from "../ui/datatable/virtual-data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Input from "../ui/input";
import { articulosColumns } from "./articulos-columns";
import { useState } from "react";
import { ProductResponse } from "@/app/(protected)/maestros/articulos/types";
import { toast } from "react-toastify";
import { Label } from "../ui/label";

interface DialogAddArticulosProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm?: (articulo: ProductResponse[]) => void;
  onClose?: () => void;
  dataArticulos: ProductResponse[];
  stockDisponible: ProductResponse[];
}

const filterArticulos = (
  data: ProductResponse[],
  filtroCod: string,
  filtroNombre: string,
): ProductResponse[] => {
  if (!filtroCod && !filtroNombre) return data;

  const termsCod = filtroCod.toLowerCase().split(/\s+/).filter(Boolean);
  const termsNombre = filtroNombre.toLowerCase().split(/\s+/).filter(Boolean);

  return data.filter((item) => {
    const codigo = (item.cod_art || "").trim().toLowerCase();
    const nombre = (item.des_art || "").trim().toLowerCase();

    const matchCod = termsCod.every((term) => codigo.includes(term));
    const matchNombre = termsNombre.every((term) => nombre.includes(term));

    return matchCod && matchNombre;
  });
};

export default function DialogAddArticulos({
  open,
  setOpen,
  onConfirm,
  stockDisponible,
}: DialogAddArticulosProps) {
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [queryCod, setQueryCod] = useState("");
  const [queryNombre, setQueryNombre] = useState("");
  const [selectedArticulo, setSelectedArticulo] = useState<ProductResponse[]>(
    [],
  );

  const articulosFiltrados = filterArticulos(
    stockDisponible,
    queryCod,
    queryNombre,
  );

  const handleBuscar = () => {
    setQueryCod(filtroCodigo);
    setQueryNombre(filtroNombre);
  };

  const handleEnviarArticulo = () => {
    if (selectedArticulo.some((val) => val.stkact < 1)) {
      toast.error("No se puede agregar artículos sin stock");
      return;
    }
    onConfirm?.(selectedArticulo);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="!max-w-[550px] px-5 !gap-3 py-6 border border-white/10 rounded-2xl shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--color-regular-text)] tracking-tight">
            Seleccionar Artículo
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex flex-col gap-1">
            <Label htmlFor="filtro-codigo">Código</Label>
            <Input
              id="filtro-codigo"
              placeholder="EJ: 00045"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              className="w-full sm:w-20"
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor="filtro-nombre">Nombre</Label>
            <Input
              id="filtro-nombre"
              placeholder="EJ: Don Hilario"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleBuscar}
            className="self-end"
          >
            Buscar
          </Button>
        </div>

        <div className="px-1 py-2">
          {articulosFiltrados.length > 0 ? (
            <DataTable
              columns={articulosColumns}
              data={articulosFiltrados}
              cantidadMostrar={10}
              onRowsSelected={setSelectedArticulo}
              maxSelection={15}
            />
          ) : (
            <div className="flex items-center justify-center h-32 rounded-xl border border-black/15 dark:border-[var(--color-border)] shadow-sm bg-gray-100 dark:bg-white/[0.02]">
              <p className="text-base font-semibold text-[var(--color-regular-text)]">
                No se encontraron artículos que coincidan con la búsqueda.
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
              setSelectedArticulo([]);
            }}
          >
            Cerrar
          </Button>

          <Button
            variant="primary"
            className="h-10 px-4"
            onClick={handleEnviarArticulo}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
