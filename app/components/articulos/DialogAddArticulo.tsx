import Button from "../ui/button";
import { DataTable } from "../ui/datatable/virtual-data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Input from "../ui/input";
import { articulosColumns } from "./articulos-columns";
import { useState } from "react";
import { useProducts } from "@/app/(protected)/maestros/articulos/api/list-articulos";
import { Spinner } from "../loading/Spinner";
import { ProductResponse } from "@/app/(protected)/maestros/articulos/types";
import { toast } from "react-toastify";
import { IPedidoDetalleFormState } from "@/app/(protected)/movimientos/pedidos/types";

interface DialogAddArticulosProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm?: (articulo: ProductResponse[]) => void;
  onClose?: () => void;
  detalles: IPedidoDetalleFormState[];
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
  detalles,
}: DialogAddArticulosProps) {
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [queryCod, setQueryCod] = useState("");
  const [queryNombre, setQueryNombre] = useState("");
  const [selectedArticulo, setSelectedArticulo] = useState<ProductResponse[]>(
    [],
  );

  const { data: dataArticulos = [], isLoading: isLoadingArticulos } =
    useProducts();

  const articulosConStockDisponible = dataArticulos.map((articulo) => {
    const cantidadEnPedido = detalles
      .filter((item) => item.id_art === articulo.id_art)
      .reduce((total, item) => total + item.can_art, 0);

    return {
      ...articulo,
      stkact: articulo.stkact - cantidadEnPedido,
    };
  });

  const articulosFiltrados = filterArticulos(
    articulosConStockDisponible,
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

        <div className="flex gap-2 items-center">
          <Input
            placeholder="Código..."
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
            className="w-20"
          />
          <Input
            placeholder="Buscar por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="flex-1"
          />
          <Button variant="primary" size="sm" onClick={handleBuscar}>
            Buscar
          </Button>
        </div>

        <div className="px-1 py-2">
          {isLoadingArticulos ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : articulosFiltrados.length > 0 ? (
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
