import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const obtenerId = async (context: RouteContext) => {
  const { id } = await context.params;
  const idCpc = Number(id);

  if (!Number.isInteger(idCpc) || idCpc <= 0) {
    return null;
  }

  return idCpc;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const idCpc = await obtenerId(context);

    if (!idCpc) {
      return Response.json(
        { message: "El ID de la factura no es válido" },
        { status: 400 },
      );
    }

    const factura = await prisma.facturacionCabecera.findUnique({
      where: { id_cpc: idCpc },
      include: {
        cliente: true,
        vendedor: true,
        metodoPago: true,
        usuarioReg: true,
        usuarioAnula: true,
        pedido: true,
        detalles: {
          include: {
            articulo: true,
            unidadMedida: true,
          },
          orderBy: {
            nroitm: "asc",
          },
        },
      },
    });

    if (!factura) {
      return Response.json(
        { message: "Factura no encontrada" },
        { status: 404 },
      );
    }

    const { detalles } = factura;

    return Response.json({
      message: "Factura obtenida correctamente",
      cabecera: {
        ano: factura.ano,
        codalm: factura.codalm,
        codmon: factura.codmon,
        diavto: factura.diavto,
        diraux: factura.diraux,
        fchcob: factura.fchcob?.toISOString().slice(0, 10) ?? null,
        fchdoc: factura.fchdoc.toISOString().slice(0, 10),
        fchvto: factura.fchvto.toISOString().slice(0, 10),
        flg_incigv: factura.flg_incigv,
        for_pago: factura.for_pago,
        id_aux: factura.id_aux,
        id_cpc: factura.id_cpc,
        id_ped: factura.id_ped,
        id_tipdoc: factura.id_tipdoc,
        id_ven: factura.id_ven,
        impadel: Number(factura.impadel),
        impigv: Number(factura.impigv),
        impsbt: Number(factura.impsbt),
        imptot: Number(factura.imptot),
        monto_a: Number(factura.monto_a),
        monto_i: Number(factura.monto_i),
        nomaux: factura.nomaux,
        nro_ped: factura.nro_ped,
        nromes: factura.nromes,
        num_doc: factura.num_doc,
        ocompra: factura.ocompra,
        porigv: Number(factura.porigv),
        rucaux: factura.rucaux,
        sdodoc: Number(factura.sdodoc),
        ser_doc: factura.ser_doc,
        tipo: factura.tipo,
        tpocmb: Number(factura.tpocmb),
        usuario: factura.usuario,

        formapago: factura.metodoPago?.forma_pago ?? null,
        pedido: factura.pedido?.nrodoc ?? null,

        estado: factura.estado,
        flg_anu: factura.flg_anu,
        fch_anu: factura.fch_anu?.toISOString() ?? null,
        fch_ing: factura.fch_ing.toISOString(),
        usuario_anu: factura.usuarioAnula?.username ?? null,
        usuario_ing: factura.usuarioReg?.username ?? null,
      },
      detalle: detalles.map((item) => ({
        ...item,
        alias_umed: item.unidadMedida.des_umed,
        factor: Number(item.factor),
        pdes_art: Number(item.pdes_art),
        pre_art: Number(item.pre_art),
        pu_des: Number(item.pu_des),
        tot_art: Number(item.tot_art),
        subtot_art: Number(item.subtot_art),
        igv_art: Number(item.igv_art),
        pu_conigv: Number(item.pu_conigv),
        pu_sinigv: Number(item.pu_sinigv),
        umedida: item.unidadMedida.des_umed,
      })),
    });
  } catch (error) {
    console.error("Error al obtener factura:", error);

    return Response.json(
      { message: "Error al obtener la factura" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const idCpc = await obtenerId(context);

    if (!idCpc) {
      return Response.json(
        { message: "El ID de la factura no es válido" },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id_usu) {
      return Response.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = Number(session.user.id_usu);

    if (!Number.isInteger(userId) || userId <= 0) {
      return Response.json({ message: "Usuario no válido" }, { status: 401 });
    }

    const body = await request.json();
    const { accion } = body;

    if (accion !== "anular") {
      return Response.json({ message: "Acción no válida" }, { status: 400 });
    }

    const factura = await prisma.$transaction(async (tx) => {
      const existente = await tx.facturacionCabecera.findUnique({
        where: { id_cpc: idCpc },
        select: {
          id_cpc: true,
          num_doc: true,
          id_remision: true,
          flg_anu: true,
          remisiones: {
            select: {
              id_remision: true,
              numero: true,
              estado: true,
              flg_anu: true,
            },
          },
          detalles: {
            select: {
              id_art: true,
              can_art: true,
              id_ped: true,
              itmped: true,
              id_alm: true,
              itmalm: true,
            },
          },
        },
      });

      if (!existente) {
        throw new Error("FACTURA_NO_ENCONTRADA");
      }

      if (existente.flg_anu) {
        throw new Error("FACTURA_YA_ANULADA");
      }

      const tieneRemisionActiva = existente.remisiones.some(
        (rem) => !rem.flg_anu && rem.estado !== "ANULADO",
      );

      if (tieneRemisionActiva) {
        throw new Error("FACTURA_TIENE_REMISION_ACTIVA");
      }

      const cantidadesPorPedido = new Map<
        string,
        {
          id_ped: number;
          itmped: number;
          cantidad: number;
        }
      >();

      const cantidadesPorArticulo = new Map<number, number>();
      const pedidosAfectados = new Set<number>();

      for (const item of existente.detalles) {
        if (item.id_alm !== null) {
          // Viene de guía de remisión: no toca can_ate ni estado del pedido
          continue;
        } else if (item.id_ped !== null) {
          if (item.itmped === null) {
            throw new Error("DETALLE_PEDIDO_NO_ENCONTRADO");
          }

          const clave = `${item.id_ped}-${item.itmped}`;
          const existentePedido = cantidadesPorPedido.get(clave);

          cantidadesPorPedido.set(clave, {
            id_ped: item.id_ped,
            itmped: item.itmped,
            cantidad: (existentePedido?.cantidad ?? 0) + item.can_art,
          });

          pedidosAfectados.add(item.id_ped);
        } else {
          cantidadesPorArticulo.set(
            item.id_art,
            (cantidadesPorArticulo.get(item.id_art) ?? 0) + item.can_art,
          );
        }
      }

      if (pedidosAfectados.size > 0) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(73002147)::text`;
      }

      const actualizado = await tx.facturacionCabecera.updateMany({
        where: {
          id_cpc: idCpc,
          flg_anu: false,
        },
        data: {
          flg_anu: true,
          estado: "ANULADO",
          usuario_anu: userId,
          fch_anu: new Date(),
        },
      });

      if (actualizado.count === 0) {
        throw new Error("FACTURA_YA_ANULADA");
      }

      if (existente.id_remision !== null) {
        await tx.guiaRemisionCabecera.updateMany({
          where: {
            id_remision: existente.id_remision,
            id_cpc: idCpc,
          },
          data: {
            id_cpc: null,
          },
        });
      }

      for (const [id_art, cantidad] of cantidadesPorArticulo) {
        await tx.product.update({
          where: { id_art },
          data: {
            stkact: { increment: cantidad },
          },
        });
      }

      for (const item of cantidadesPorPedido.values()) {
        const actualizadoDetalle = await tx.pedidoDetalle.updateMany({
          where: {
            id_ped: item.id_ped,
            nroitm: item.itmped,
            can_ate: { gte: item.cantidad },
          },
          data: {
            can_ate: { decrement: item.cantidad },
          },
        });

        if (actualizadoDetalle.count === 0) {
          throw new Error("CANTIDAD_DESPACHADA_INVALIDA");
        }
      }

      for (const id_ped of pedidosAfectados) {
        const pedidoDetalles = await tx.pedidoDetalle.findMany({
          where: { id_ped },
        });

        const atendido = pedidoDetalles.every(
          (item) => item.can_ate >= item.can_art,
        );

        const algunoAtendido = pedidoDetalles.some((item) => item.can_ate > 0);

        await tx.pedidoCabecera.update({
          where: { id_ped },
          data: {
            estado: atendido
              ? "ATENDIDO"
              : algunoAtendido
                ? "PARCIAL"
                : "INGRESADO",
          },
        });
      }

      return tx.facturacionCabecera.findUnique({
        where: { id_cpc: idCpc },
        select: {
          id_cpc: true,
          num_doc: true,
          estado: true,
          flg_anu: true,
        },
      });
    });

    if (!factura) {
      throw new Error("FACTURA_NO_ENCONTRADA");
    }

    return Response.json({
      message: `Factura ${factura.num_doc} anulada correctamente`,
      data: factura,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FACTURA_NO_ENCONTRADA") {
        return Response.json(
          { message: "Factura no encontrada" },
          { status: 404 },
        );
      }

      if (error.message === "FACTURA_YA_ANULADA") {
        return Response.json(
          { message: "La factura ya se encuentra anulada" },
          { status: 409 },
        );
      }

      if (error.message === "FACTURA_TIENE_REMISION_ACTIVA") {
        return Response.json(
          {
            message:
              "No se puede anular la factura porque está asociada a una guía de remisión activa. Anule la guía primero.",
          },
          { status: 409 },
        );
      }

      if (error.message === "DETALLE_PEDIDO_NO_ENCONTRADO") {
        return Response.json(
          { message: "No se encontró el detalle del pedido asociado" },
          { status: 404 },
        );
      }

      if (error.message === "CANTIDAD_DESPACHADA_INVALIDA") {
        return Response.json(
          { message: "La cantidad despachada del pedido no es válida" },
          { status: 409 },
        );
      }

      if (error.message === "ORIGEN_DETALLE_INVALIDO") {
        return Response.json(
          { message: "El detalle de la factura tiene un origen no válido" },
          { status: 409 },
        );
      }
    }

    console.error("Error al anular factura:", error);

    return Response.json(
      { message: "Error al anular la factura" },
      { status: 500 },
    );
  }
}
