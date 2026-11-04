import Input from "./input";
import { Label } from "./label";

interface TotalesProps {
  subtotal: number;
  igv: number;
  total: number;
}

export default function Totales({ subtotal, igv, total }: TotalesProps) {
  return (
    <div className="flex justify-center sm:justify-end">
      <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-3 w-fit">
        <Label htmlFor="subtotal" className="text-right">
          SUBTOTAL
        </Label>
        <Input
          id="subtotal"
          className="!w-28 text-right"
          value={subtotal.toFixed(2)}
          readOnly
        />

        <Label htmlFor="igv" className="text-right">
          IGV
        </Label>
        <Input
          id="igv"
          className="!w-28 text-right"
          value={igv.toFixed(2)}
          readOnly
        />

        <Label htmlFor="total" className="text-right">
          TOTAL
        </Label>
        <Input
          id="total"
          className="!w-28 text-right"
          value={total.toFixed(2)}
          readOnly
        />
      </div>
    </div>
  );
}
