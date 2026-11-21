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

    const facturas = await prisma.facturacionCabecera.findMany({
      where: {
        id_aux,
        tipo: "3",
        flg_anu: false,
        estado: { not: "ANULADO" },
      },
      select: {
        id_cpc: true,
        ano: true,
        codalm: true,
        codmon: true,
        diavto: true,
        diraux: true,
        fchcob: true,
        fchdoc: true,
        fchvto: true,
        flg_incigv: true,
        for_pago: true,
        id_aux: true,
        id_ped: true,
        id_remision: true,
        id_tipdoc: true,
        id_ven: true,
        impadel: true,
        impigv: true,
        impsbt: true,
        imptot: true,
        monto_a: true,
        monto_i: true,
        nomaux: true,
        nro_ped: true,
        nromes: true,
        num_doc: true,
        ocompra: true,
        porigv: true,
        rucaux: true,
        sdodoc: true,
        ser_doc: true,
        tipo: true,
        tpocmb: true,
        usuario: true,

        metodoPago: {
          select: {
            forma_pago: true,
          },
        },

        remision: {
          select: {
            serie: true,
            numero: true,
            flg_anu: true,
            estado: true,
          },
        },

        detalles: {
          select: {
            nroitm: true,
            id_art: true,
            cod_art: true,
            des_art: true,
            id_umedr: true,
            factor: true,
            can_art: true,
            pre_art: true,
            pdes_art: true,
            pu_des: true,
            tot_art: true,
            des_ar1: true,
            des_ar2: true,
            des_ar3: true,
            des_ar4: true,
            des_ar5: true,
            des_ar6: true,
            des_ar7: true,
            des_ar8: true,
            subtot_art: true,
            igv_art: true,
            pu_conigv: true,
            pu_sinigv: true,
            operador: true,
            id_ped: true,
            itmped: true,
            id_alm: true,
            itmalm: true,
            nroped: true,
            nroalm: true,

            unidadMedida: {
              select: {
                alias_umed: true,
              },
            },
          },
        },
      },
      orderBy: { num_doc: "desc" },
    });

    const data = facturas.map(
      ({ metodoPago, remision, detalles, ...cabecera }) => {
        const remisionOrigenActiva =
          remision && !remision.flg_anu && remision.estado !== "ANULADO"
            ? remision
            : null;

        return {
          ...cabecera,
          formapago: metodoPago?.forma_pago ?? null,
          guia_remision: remisionOrigenActiva
            ? `${remisionOrigenActiva.serie}-${remisionOrigenActiva.numero}`
            : null,
          impigv: Number(cabecera.impigv) || 0,
          impsbt: Number(cabecera.impsbt) || 0,
          imptot: Number(cabecera.imptot) || 0,
          monto_a: Number(cabecera.monto_a) || 0,
          porigv: Number(cabecera.porigv) || 0,
          tpocmb: Number(cabecera.tpocmb) || 0,
          detalles: detalles.map(({ unidadMedida, ...item }) => ({
            ...item,
            alias_umed: unidadMedida.alias_umed,
          })),
        };
      },
    );

    return Response.json({ data });
  } catch (error) {
    console.error("Error al listar facturas del cliente:", error);

    return Response.json(
      { message: "Error al listar las facturas del cliente" },
      { status: 500 },
    );
  }
}
