import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const obtenerId = async (context: RouteContext) => {
  const { id } = await context.params;
  const idRemision = Number(id);

  if (!Number.isInteger(idRemision) || idRemision <= 0) {
    return null;
  }

  return idRemision;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const idRemision = await obtenerId(context);

    if (!idRemision) {
      return Response.json(
        { message: "El ID de la remisión no es válido" },
        { status: 400 },
      );
    }

    const remision = await prisma.guiaRemisionCabecera.findUnique({
      where: { id_remision: idRemision },
      include: {
        cliente: true,
        vendedor: true,
        metodoPago: true,
        usuarioReg: true,
        usuarioAnula: true,
        pedido: true,
        factura: true, // <-- Incluimos la relación de la factura asociada
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

    if (!remision) {
      return Response.json(
        { message: "Remisión no encontrada" },
        { status: 404 },
      );
    }

    const { detalles } = remision;

    return Response.json({
      message: "Remisión obtenida correctamente",
      cabecera: {
        almdes: remision.almdes,
        almori: remision.almori,
        ano: remision.ano,
        bultos: remision.bultos,
        codalm: remision.codalm,
        codmon: remision.codmon,
        codmov: remision.codmov,
        dirent: remision.dirent,
        factura: remision.factura
          ? `${remision.factura.ser_doc}-${remision.factura.num_doc}`
          : null,
        fchdoc: remision.fchdoc.toISOString().slice(0, 10),
        fchtras: remision.fchtras.toISOString().slice(0, 10),
        flg_incigv: remision.flg_incigv,
        for_pago: remision.for_pago,
        glosa: remision.glosa,
        id_remision: remision.id_remision,
        id_aux: remision.id_aux,
        id_chof: remision.id_chof,
        id_ped: remision.id_ped,
        id_cpc: remision.factura?.id_cpc ?? remision.id_cpc,
        id_transp: remision.id_transp,
        id_vehi: remision.id_vehi,
        id_ven: remision.id_ven,
        mes: remision.mes,
        nomaux: remision.nomaux,
        numero: remision.numero,
        pedido: remision.pedido?.nrodoc ?? null,
        peso: Number(remision.peso),
        porigv: Number(remision.porigv),
        ptopartida: remision.ptopartida,
        rucaux: remision.rucaux,
        serie: remision.serie,
        tpocmb: Number(remision.tpocmb),
        ubigeo1: remision.ubigeo1,
        ubigeo2: remision.ubigeo2,
        usuario: remision.usuario,

        estado: remision.estado,
        flg_anu: remision.flg_anu,
        fch_anu: remision.fch_anu?.toISOString() ?? null,
        fch_ing: remision.fch_ing.toISOString(),
        usu_anu: remision.usuario_anu,
        usuario_anu: remision.usuarioAnula?.username ?? null,
        usuario_ing: remision.usuarioReg?.username ?? null,
      },
      detalle: detalles.map((item) => ({
        ...item,
        alias_umed: item.unidadMedida.des_umed,
        can_art: Number(item.can_art),
        factor: Number(item.factor),
        igv_art: Number(item.igv_art),
        pdes_art: Number(item.pdes_art),
        pre_art: Number(item.pre_art),
        pu_conigv: Number(item.pu_conigv),
        pu_des: Number(item.pu_des),
        pu_sinigv: Number(item.pu_sinigv),
        subtot_art: Number(item.subtot_art),
        tot_art: Number(item.tot_art),
        umedida: item.unidadMedida.des_umed,
      })),
    });
  } catch (error) {
    console.error("Error al obtener remisión:", error);

    return Response.json(
      { message: "Error al obtener la remisión" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const idRemision = await obtenerId(context);

    if (!idRemision) {
      return Response.json(
        { message: "El ID de la remisión no es válido" },
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

    const remision = await prisma.$transaction(async (tx) => {
      const existente = await tx.guiaRemisionCabecera.findUnique({
        where: { id_remision: idRemision },
        select: {
          id_remision: true,
          numero: true,
          id_ped: true,
          flg_anu: true,
          factura: {
            select: {
              id_cpc: true,
              estado: true,
              flg_anu: true,
            },
          },
          detalles: {
            select: {
              id_art: true,
              itmped: true,
              can_art: true,
            },
          },
        },
      });

      if (!existente) {
        throw new Error("REMISION_NO_ENCONTRADA");
      }

      if (existente.flg_anu) {
        throw new Error("REMISION_YA_ANULADA");
      }

      if (
        existente.factura &&
        !existente.factura.flg_anu &&
        existente.factura.estado !== "ANULADO"
      ) {
        throw new Error("REMISION_TIENE_FACTURA_ACTIVA");
      }

      if (existente.id_ped !== null) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(73002147)::text`;
      }

      const actualizado = await tx.guiaRemisionCabecera.updateMany({
        where: {
          id_remision: idRemision,
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
        throw new Error("REMISION_YA_ANULADA");
      }

      if (existente.id_ped === null) {
        const cantidadesPorArticulo = new Map<number, number>();

        for (const item of existente.detalles) {
          cantidadesPorArticulo.set(
            item.id_art,
            (cantidadesPorArticulo.get(item.id_art) ?? 0) + item.can_art,
          );
        }

        for (const [id_art, cantidad] of cantidadesPorArticulo) {
          await tx.product.update({
            where: { id_art },
            data: {
              stkact: { increment: cantidad },
            },
          });
        }
      }

      if (existente.id_ped !== null) {
        for (const item of existente.detalles) {
          if (item.itmped === null) {
            throw new Error("DETALLE_PEDIDO_NO_ENCONTRADO");
          }

          const actualizadoDetalle = await tx.pedidoDetalle.updateMany({
            where: {
              id_ped: existente.id_ped,
              nroitm: item.itmped,
              can_ate: { gte: item.can_art },
            },
            data: {
              can_ate: { decrement: item.can_art },
            },
          });

          if (actualizadoDetalle.count === 0) {
            throw new Error("CANTIDAD_DESPACHADA_INVALIDA");
          }
        }

        const pedidoDetalles = await tx.pedidoDetalle.findMany({
          where: { id_ped: existente.id_ped },
        });

        const atendido = pedidoDetalles.every(
          (item) => item.can_ate >= item.can_art,
        );

        const algunoAtendido = pedidoDetalles.some((item) => item.can_ate > 0);

        await tx.pedidoCabecera.update({
          where: { id_ped: existente.id_ped },
          data: {
            estado: atendido
              ? "ATENDIDO"
              : algunoAtendido
                ? "PARCIAL"
                : "INGRESADO",
          },
        });
      }

      return tx.guiaRemisionCabecera.findUnique({
        where: { id_remision: idRemision },
        select: {
          id_remision: true,
          numero: true,
          estado: true,
          flg_anu: true,
        },
      });
    });

    if (!remision) {
      throw new Error("REMISION_NO_ENCONTRADA");
    }

    return Response.json({
      message: `Remisión ${remision.numero} anulada correctamente`,
      data: remision,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "REMISION_NO_ENCONTRADA") {
        return Response.json(
          { message: "Remisión no encontrada" },
          { status: 404 },
        );
      }

      if (error.message === "REMISION_YA_ANULADA") {
        return Response.json(
          { message: "La remisión ya se encuentra anulada" },
          { status: 409 },
        );
      }

      if (error.message === "REMISION_TIENE_FACTURA_ACTIVA") {
        return Response.json(
          {
            message:
              "No se puede anular la remisión porque tiene una factura activa asociada. Anule la factura primero.",
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
    }

    console.error("Error al anular remisión:", error);

    return Response.json(
      { message: "Error al anular la remisión" },
      { status: 500 },
    );
  }
}
