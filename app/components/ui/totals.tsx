import Input from "./input";
import { Label } from "./label";

interface TotalesProps {
  subtotal: number | string;
  igv: number | string;
  total: number | string;
  mostrarTotal?: boolean;
}

export default function Totales({
  subtotal,
  igv,
  total,
  mostrarTotal = true,
}: TotalesProps) {
  const safeSubtotal = Number(subtotal) || 0;
  const safeIgv = Number(igv) || 0;
  const safeTotal = Number(total) || 0;

  return (
    <>
      {mostrarTotal && (
        <div className="flex justify-center sm:justify-end">
          <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-3 w-fit">
            <Label htmlFor="subtotal" className="text-right">
              SUBTOTAL
            </Label>
            <Input
              id="subtotal"
              className="!w-28 text-right"
              value={safeSubtotal.toFixed(2)}
              readOnly
            />

            <Label htmlFor="igv" className="text-right">
              IGV
            </Label>
            <Input
              id="igv"
              className="!w-28 text-right"
              value={safeIgv.toFixed(2)}
              readOnly
            />

            <Label htmlFor="total" className="text-right">
              TOTAL
            </Label>
            <Input
              id="total"
              className="!w-28 text-right"
              value={safeTotal.toFixed(2)}
              readOnly
            />
          </div>
        </div>
      )}
    </>
  );
}
