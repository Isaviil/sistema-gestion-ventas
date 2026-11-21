import { prisma } from "@/app/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const id_aux = Number(id);

    if (!Number.isInteger(id_aux) || id_aux <= 0) {
      return Response.json(
        { message: "El identificador del cliente no es válido" },
        { status: 400 },
      );
    }

    const remisiones = await prisma.guiaRemisionCabecera.findMany({
      where: {
        id_aux,
        flg_anu: false,
        codmov: "01",
        estado: "INGRESADO",
      },
      select: {
        id_remision: true,
        id_ped: true,
        ano: true,
        mes: true,
        serie: true,
        numero: true,
        rucaux: true,
        nomaux: true,
        codmon: true,
        tpocmb: true,
        id_ven: true,
        for_pago: true,
        glosa: true,
        fchdoc: true,
        fchtras: true,
        flg_incigv: true,
        dirent: true,
        almdes: true,
        almori: true,
        codalm: true,
        codmov: true,
        bultos: true,
        peso: true,
        porigv: true,
        ptopartida: true,
        id_chof: true,
        id_transp: true,
        id_vehi: true,
        ubigeo1: true,
        ubigeo2: true,
        usuario: true,
        fch_ing: true,
        fch_anu: true,
        flg_anu: true,
        estado: true,

        pedido: {
          select: {
            nrodoc: true,
          },
        },

        metodoPago: {
          select: {
            forma_pago: true,
          },
        },

        detalles: {
          select: {
            can_art: true,
            cod_art: true,
            des_ar1: true,
            des_ar2: true,
            des_ar3: true,
            des_ar4: true,
            des_ar5: true,
            des_ar6: true,
            des_ar7: true,
            des_ar8: true,
            des_art: true,
            factor: true,
            id_art: true,
            id_remision: true,
            id_ped: true,
            id_umedr: true,
            igv_art: true,
            itmped: true,
            nroitm: true,
            nroped: true,
            operador: true,
            pdes_art: true,
            pre_art: true,
            pu_conigv: true,
            pu_des: true,
            pu_sinigv: true,
            subtot_art: true,
            tot_art: true,

            unidadMedida: {
              select: {
                alias_umed: true,
              },
            },
          },
        },
      },
      orderBy: { numero: "desc" },
    });

    const data = remisiones.map(
      ({ metodoPago, pedido, detalles, ...cabecera }) => ({
        ...cabecera,
        pedido: pedido?.nrodoc ?? null,
        formapago: metodoPago?.forma_pago ?? null,
        detalles: detalles.map(({ unidadMedida, ...item }) => ({
          ...item,
          alias_umed: unidadMedida.alias_umed,
          id_alm: item.id_remision,
          itmalm: item.nroitm,
          nroalm: cabecera.numero,
        })),
      }),
    );

    return Response.json({ data });
  } catch (error) {
    console.error("Error al listar guías de remisión del cliente:", error);

    return Response.json(
      { message: "Error al listar las guías de remisión del cliente" },
      { status: 500 },
    );
  }
}
