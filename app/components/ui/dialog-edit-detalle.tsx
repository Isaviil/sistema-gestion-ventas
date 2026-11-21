import { useState } from "react";
import Button from "../ui/button";
import InputNumber from "../ui/input-number";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { ArrowLeft, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "react-toastify";

type DetallePrecios = {
  pre_art: number;
  pdes_art: number;
  pu_des: number;
  pu_conigv: number;
  pu_sinigv: number;
  tot_art: number;
  can_art: number;
  operador: string;
  subtot_art: number;
};

interface DialogEditDetalleProps<T extends DetallePrecios> {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: T;
  igv: number;
  onOpen?: () => void;
  onClose?: () => void;
  onCommit?: (data: DetallePrecios) => void;
  isRemision?: boolean;
}

export default function DialogEditDetalle<T extends DetallePrecios>({
  open,
  setOpen,
  igv,
  onClose,
  onCommit,
  data,
  isRemision,
}: DialogEditDetalleProps<T>) {
  const [preArt, setPreArt] = useState(data?.pre_art ?? 0);
  const [descuento, setDescuento] = useState(data?.pdes_art ?? 0);
  const [pdesArt, setPdesArt] = useState(data?.pu_des ?? 0);
  const [puConIgv, setPuConIgv] = useState(data?.pu_conigv ?? 0);
  const [puSinIgv, setPuSinIgv] = useState(data?.pu_sinigv ?? 0);
  const [totArt, setTotArt] = useState(data?.tot_art ?? 0);
  const [cantidad, setCantidad] = useState(data?.can_art ?? 0);
  const [operador, setOperador] = useState(data?.operador ?? "1");
  const [subtotArt, setSubtotArt] = useState(data?.subtot_art ?? 0);

  /*
   *=========================
   * HANDLERS
   *=========================
   */

  const calcularPrecios = (
    precioDescuento: number,
    operadorActual: string,
    cantidadActual: number,
  ) => {
    const precioConIgv = precioDescuento;
    const precioSinIgv =
      operadorActual === "1"
        ? Number((precioDescuento / (1 + igv / 100)).toFixed(7))
        : precioDescuento;

    setPuConIgv(precioConIgv);
    setPuSinIgv(precioSinIgv);
    setSubtotArt(Number((precioSinIgv * cantidadActual).toFixed(2)));
    setTotArt(precioDescuento * cantidadActual);
  };

  const handleClose = () => {
    onClose?.();
  };

  const handlePreArtChange = (value: number) => {
    const precioOriginal = Math.max(0, value);
    const precioDescuento = precioOriginal * (1 - descuento / 100);

    setPreArt(precioOriginal);
    setPdesArt(precioDescuento);

    calcularPrecios(precioDescuento, operador, cantidad);
  };

  const handleDescuentoChange = (value: number) => {
    const descuentoSeguro = Math.min(100, Math.max(0, value));
    const precioDescuento = preArt * (1 - descuentoSeguro / 100);

    setDescuento(descuentoSeguro);
    setPdesArt(precioDescuento);

    calcularPrecios(precioDescuento, operador, cantidad);
  };

  const handleNuevoPrecioChange = (value: number) => {
    const precioDescuento = Math.min(preArt, Math.max(0, value));
    const nuevoDescuento =
      preArt === 0 ? 0 : ((preArt - precioDescuento) / preArt) * 100;

    setPdesArt(precioDescuento);
    setDescuento(nuevoDescuento);

    calcularPrecios(precioDescuento, operador, cantidad);
  };

  const handleCantidadChange = (value: number) => {
    setCantidad(value);
    calcularPrecios(pdesArt, operador, value);
  };

  // Cambio de operador
  const handleOperadorChange = (value: string) => {
    setOperador(value);
    calcularPrecios(pdesArt, value, cantidad);
  };

  const handleGuardar = () => {
    onCommit?.({
      pre_art: preArt,
      pdes_art: descuento,
      pu_des: pdesArt,
      pu_conigv: puConIgv,
      pu_sinigv: puSinIgv,
      can_art: cantidad,
      tot_art: totArt,
      subtot_art: subtotArt,
      operador,
    });
    setOpen(false);
    toast.success("Artículo editado correctamente", { autoClose: 1600 });
  };

  /*
   *=========================
   * FORMULARIO
   *=========================
   */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="!max-w-[300px] px-4 !gap-3 py-5 border border-white/10 rounded-2xl shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[var(--color-regular-text)] tracking-tight">
            Editar Detalle
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="cantidad">Cantidad</Label>
            <InputNumber
              id="cantidad"
              name="cantidad"
              value={cantidad}
              onChange={(e) => handleCantidadChange(Number(e.target.value))}
              className="max-w-32"
            />
          </div>

          {!isRemision && (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="pre_art">Precio</Label>
                <InputNumber
                  id="pre_art"
                  name="pre_art"
                  value={preArt}
                  onChange={(e) => handlePreArtChange(Number(e.target.value))}
                  className="max-w-32"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="pdes_art">Descuento %</Label>
                <InputNumber
                  id="pdes_art"
                  name="pdes_art"
                  value={descuento}
                  onChange={(e) =>
                    handleDescuentoChange(Number(e.target.value))
                  }
                  className="max-w-32"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="pu_des">Nuevo Precio</Label>
                <InputNumber
                  id="pu_des"
                  name="pu_des"
                  value={pdesArt}
                  onChange={(e) =>
                    handleNuevoPrecioChange(Number(e.target.value))
                  }
                  disabled
                  className="max-w-32"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="pu_conigv">Precio con IGV</Label>
                <InputNumber
                  id="pu_conigv"
                  name="pu_conigv"
                  value={puConIgv}
                  disabled
                  className="max-w-32"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="pu_sinigv">Precio sin IGV</Label>
                <InputNumber
                  id="pu_sinigv"
                  name="pu_sinigv"
                  value={puSinIgv}
                  disabled
                  className="max-w-32"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="tot_art">Total</Label>
                <InputNumber
                  id="tot_art"
                  name="tot_art"
                  value={totArt}
                  onChange={(e) => setTotArt(Number(e.target.value))}
                  disabled
                  className="max-w-32"
                />
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <Label htmlFor="operador">Operador</Label>
                <Select value={operador} onValueChange={handleOperadorChange}>
                  <SelectTrigger
                    id="operador"
                    className="data-[placeholder]:!normal-case"
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">GRABADO</SelectItem>
                    <SelectItem value="2" disabled>
                      INAFECTO
                    </SelectItem>
                    <SelectItem value="3" disabled>
                      EXONERADO
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="brandSubtle"
            className="h-9 px-3 cursor-pointer"
            onClick={handleClose}
          >
            <ArrowLeft size={14} className="mr-1" />
            Salir
          </Button>

          <Button
            variant="primary"
            className="h-9 px-3 cursor-pointer"
            onClick={handleGuardar}
          >
            <Save size={14} className="mr-1" />
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
