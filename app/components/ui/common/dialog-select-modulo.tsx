import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../dialog";
import { DataTable, features } from "../datatable/virtual-data-table";
import Button from "../button";
import { ArrowBigLeft, Save } from "lucide-react";
import { columnsSegunModulo } from "./columns-dialog-modulos";
import { ColumnDef } from "@tanstack/react-table";
import { IPedidoDetalleFormState } from "@/app/(protected)/movimientos/pedidos/types";
import LoadingSidebar from "../../loading/LoadingSidebar";
import { IGuiaremisionDetalleFormState } from "@/app/(protected)/movimientos/guia-remision/types";
import { FacturacionDetalleFormState } from "@/app/(protected)/movimientos/facturacion/types";

export interface Modulos {
  pedidos: IDocumentoPorCliente;
  facturas: IDocumentoPorCliente;
  remisiones: IDocumentoPorCliente;
}

export interface IDocumentoPorCliente {
  id_ped?: number | null;
  id_remision?: number | null;
  id_cpc?: number;

  serie?: string;
  numero?: string;
  nrodoc?: string;
  rucaux: string;
  nomaux: string;
  formapago: string;
  codmon: string;
  imptot?: number;
  tpocmb: number;
  id_ven: number | null;
  for_pago: number;
  glosa?: string | null;
  fchdoc: string;

  detalles: (
    | IPedidoDetalleFormState
    | IGuiaremisionDetalleFormState
    | FacturacionDetalleFormState
  )[];
}

interface DialogAddModuloProps<K extends keyof Modulos> {
  modulo: K;
  open: boolean;
  setOpen: (open: boolean) => void;
  onCommit?: (documento: IDocumentoPorCliente) => void;
  onClose?: () => void;
  data: Modulos[K][];
  isLoading: boolean;
}

export default function DialogAddModulo<K extends keyof Modulos>(
  props: DialogAddModuloProps<K>,
) {
  const { modulo, open, setOpen, onCommit, data, isLoading } = props;

  const [selectedElement, setSelectedElement] = useState<Modulos[K][]>([]);

  const handleCloseModulo = () => {
    setSelectedElement([]);
    setOpen(false);
  };

  const handleCommitSelection = () => {
    if (!selectedElement.length) return;

    onCommit?.(selectedElement[0]);
    handleCloseModulo();
  };

  // Tipo de columna según el prop
  const columns = columnsSegunModulo[modulo] as ColumnDef<
    typeof features,
    Modulos[K],
    unknown
  >[];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="!max-w-[650px] px-5 !gap-3 py-6 border border-white/10 rounded-2xl shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--color-regular-text)] tracking-tight">
            Seleccione un elemento
          </DialogTitle>
        </DialogHeader>

        <div className="px-1 py-2">
          {isLoading ? (
            <LoadingSidebar />
          ) : data.length > 0 ? (
            <DataTable
              columns={columns}
              data={data}
              cantidadMostrar={10}
              onRowsSelected={setSelectedElement}
              maxSelection={1}
            />
          ) : (
            <div className="flex items-center justify-center h-32 rounded-xl border border-black/15 dark:border-[var(--color-border)] shadow-sm bg-gray-100 dark:bg-white/[0.02]">
              <p className="text-[13px] font-semibold text-[var(--color-regular-text)]">
                No se encontraron documentos que coincidan con la búsqueda.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="cancel"
            onClick={handleCloseModulo}
            startIcon={<ArrowBigLeft size={18} />}
            className="cursor-pointer"
          >
            Cerrar
          </Button>

          <Button
            variant="primary"
            onClick={handleCommitSelection}
            startIcon={<Save size={18} />}
            className="cursor-pointer"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
