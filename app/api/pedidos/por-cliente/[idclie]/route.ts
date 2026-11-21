import { prisma } from "@/app/lib/prisma";

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ idclie: string }> },
) {
  try {
    const { idclie } = await params;
    const id_clie = Number(idclie);

    if (!Number.isInteger(id_clie) || id_clie <= 0) {
      return Response.json(
        { message: "El identificador del cliente no es válido" },
        { status: 400 },
      );
    }

    const pedidos = await prisma.pedidoCabecera.findMany({
      where: {
        id_clie,
        flg_anu: false,
        estado: {
          in: ["APROBADO", "PARCIAL"],
        },
        detalles: {
          some: {
            can_art: {
              gt: 0,
            },
          },
        },
      },
      select: {
        id_ped: true,
        nrodoc: true,
        rucaux: true,
        nomaux: true,
        codmon: true,
        tpocmb: true,
        id_ven: true,
        for_pago: true,
        glosa: true,
        fchdoc: true,
        flg_incigv: true,
        porigv: true,
        detalles: {
          where: {
            can_art: { gt: 0 },
          },
          select: {
            nroitm: true,
            id_art: true,
            id_umedr: true,
            id_ped: true,
            cod_art: true,
            des_art: true,
            des_ar1: true,
            des_ar2: true,
            des_ar3: true,
            des_ar4: true,
            des_ar5: true,
            des_ar6: true,
            des_ar7: true,
            des_ar8: true,
            can_art: true,
            can_ate: true,
            factor: true,
            operador: true,
            alias_umed: true,
            pre_art: true,
            pdes_art: true,
            igv_art: true,
            pu_conigv: true,
            pu_sinigv: true,
            pu_des: true,
            subtot_art: true,
            tot_art: true,
          },
        },
        metodoPago: {
          select: {
            forma_pago: true,
          },
        },
      },
      orderBy: { nrodoc: "desc" },
    });

    const data = pedidos
      .map(({ metodoPago, detalles, ...pedido }) => {
        const detallesActualizados = detalles
          .filter((item) => item.can_art - item.can_ate > 0)
          .map((item) => {
            const pendiente = item.can_art - item.can_ate;
            const tieneDescuento = Number(item.pdes_art) > 0;
            const precioUnitario = tieneDescuento
              ? Number(item.pu_des)
              : Number(item.pre_art);
            const tasaIgv = Number(item.igv_art || pedido.porigv || 0);

            const totalLinea = round2(pendiente * precioUnitario);
            const subtotalLinea =
              tasaIgv > 0
                ? pedido.flg_incigv
                  ? round2(totalLinea / (1 + tasaIgv / 100))
                  : round2(pendiente * Number(item.pu_sinigv || precioUnitario))
                : totalLinea;
            const igvLinea = round2(totalLinea - subtotalLinea);

            return {
              ...item,
              can_pendiente: pendiente,
              subtot_art: subtotalLinea,
              igv_art: igvLinea,
              tot_art: totalLinea,
            };
          });

        const imptot = round2(
          detallesActualizados.reduce((total, d) => total + d.tot_art, 0),
        );

        return {
          ...pedido,
          imptot,
          formapago: metodoPago.forma_pago,
          detalles: detallesActualizados,
        };
      })
      .filter((pedido) => pedido.detalles.length > 0);

    return Response.json({ data });
  } catch (error) {
    console.error("Error al listar pedidos del cliente:", error);
    return Response.json(
      { message: "Error al listar los pedidos del cliente" },
      { status: 500 },
    );
  }
}
