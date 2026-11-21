import { useUnitsOfMeasure } from "@/app/(protected)/maestros/articulos/api/servicios/get-unidad-medida";
import { FacturacionDetalleFormState } from "../types";

export const useAgregarProducto = (igv: number) => {
  const { data: dataUnidadMedida = [] } = useUnitsOfMeasure();

  const agregarProducto = (
    nuevosDetalles: FacturacionDetalleFormState[],
    originalIndex: number,
  ) => {
    return nuevosDetalles.map((item, index) => {
      const precioBase = Number(item.pre_art) || 0;
      const cantidad = 1;

      const pu_conigv = precioBase;
      const pu_sinigv = Number((pu_conigv / (1 + igv / 100)).toFixed(7));

      const subtot_art = Number((pu_sinigv * cantidad).toFixed(2));
      const tot_art = Number((pu_conigv * cantidad).toFixed(2));

      const unidadMatch = dataUnidadMedida.find(
        (unidad) => unidad.id_umed === item.id_umedr,
      );

      return {
        ...item,
        nroitm: originalIndex + index + 1,
        can_art: cantidad,
        cantidad,
        pre_art: precioBase,
        pu_sinigv,
        pu_conigv,
        subtot_art,
        tot_art,
        alias_umed: unidadMatch?.alias_umed ?? "",
        igv_art: igv,
        pu_des: precioBase,
      };
    });
  };

  return { agregarProducto };
};
