import { prisma } from "@/app/lib/prisma";
import {
  IPedidoCabeceraForm,
  IPedidoDetalleForm,
} from "@/app/(protected)/movimientos/pedidos/types";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const estadosModificables = ["INGRESADO"];

const obtenerId = async (context: RouteContext) => {
  const { id } = await context.params;
  const idPed = Number(id);

  if (!Number.isInteger(idPed) || idPed <= 0) {
    return null;
  }

  return idPed;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const idPed = await obtenerId(context);

    if (!idPed) {
      return Response.json(
        { message: "El ID del pedido no es válido" },
        { status: 400 },
      );
    }

    const pedido = await prisma.pedidoCabecera.findUnique({
      where: { id_ped: idPed },
      include: {
        cliente: true,
        vendedor: true,
        metodoPago: true,
        usuarioReg: true,
        detalles: {
          include: {
            unidadMedida: true,
          },
          orderBy: {
            nroitm: "asc",
          },
        },
      },
    });

    if (!pedido) {
      return Response.json(
        { message: "Pedido no encontrado" },
        { status: 404 },
      );
    }

    const cabecera = {
      ano: pedido.ano,
      codmon: pedido.codmon,
      cotizacion: pedido.cotizacion,
      diraux: pedido.diraux,
      estado: pedido.estado,
      factura: pedido.factura,
      fch_anu: pedido.fch_anu?.toISOString() ?? null,
      fch_aprob: pedido.fch_aprob?.toISOString() ?? null,
      fch_ate: pedido.fch_ate?.toISOString() ?? null,
      fch_ent: pedido.fch_ent.toISOString(),
      fch_ing: pedido.fch_ing.toISOString(),
      fchdoc: pedido.fchdoc.toISOString(),
      flg_anu: pedido.flg_anu,
      flg_aprob: pedido.flg_aprob,
      flg_incigv: pedido.flg_incigv,
      for_pago: pedido.for_pago,
      formapago: pedido.metodoPago.forma_pago,
      glosa: pedido.glosa,
      guia_remision: pedido.guia_remision,
      id_clie: pedido.id_clie,
      id_ped: pedido.id_ped,
      id_ven: pedido.id_ven,
      impbto: Number(pedido.impbto),
      impigv: Number(pedido.impigv),
      imptot: Number(pedido.imptot),
      mes: pedido.mes,
      moneda: pedido.codmon,
      nomaux: pedido.nomaux,
      nrodoc: pedido.nrodoc,
      ocompra: pedido.ocompra,
      rucaux: pedido.rucaux,
      tpocmb: Number(pedido.tpocmb),
      usu_anu: pedido.usuario_anu,
      usu_aprob: pedido.usuario_aprob,
      usu_cie: pedido.usuario_cie,
      usuario: pedido.usuario,
      usuario_anu: pedido.usuario_anu,
      usuario_aprob: pedido.usuario_aprob,
      usuario_cie: pedido.usuario_cie,
      usuario_ing: pedido.usuarioReg.username,
      vendedor: [
        pedido.vendedor.nom_aux,
        pedido.vendedor.ape_aux,
        pedido.vendedor.ape_mat,
      ]
        .filter(Boolean)
        .join(" "),
    };

    const detalle = pedido.detalles.map((item) => ({
      alias_umed: item.alias_umed,
      can_art: Number(item.can_art),
      can_ate: 0,
      can_pend: Number(item.can_art),
      cod_art: item.cod_art,
      des_ar1: item.des_ar1,
      des_ar2: item.des_ar2,
      des_ar3: item.des_ar3,
      des_ar4: item.des_ar4,
      des_ar5: item.des_ar5,
      des_ar6: item.des_ar6,
      des_ar7: item.des_ar7,
      des_ar8: item.des_ar8,
      des_art: item.des_art,
      factor: Number(item.factor),
      id_art: item.id_art,
      id_ped: item.id_ped,
      id_umedr: item.id_umedr,
      igv_art: Number(item.igv_art),
      nroitm: item.nroitm,
      operador: item.operador,
      pdes_art: Number(item.pdes_art),
      pre_art: Number(item.pre_art),
      pu_conigv: Number(item.pu_conigv),
      pu_des: Number(item.pu_des),
      pu_sinigv: Number(item.pu_sinigv),
      subtot_art: Number(item.subtot_art),
      tot_art: Number(item.tot_art),
      umedida: item.unidadMedida.des_umed,
    }));

    return Response.json({
      message: "Pedido obtenido correctamente",
      cabecera,
      detalle,
    });
  } catch {
    return Response.json(
      { message: "Error al obtener el pedido" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const idPed = await obtenerId(context);

    if (!idPed) {
      return Response.json(
        { message: "El ID del pedido no es válido" },
        { status: 400 },
      );
    }

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !body.cabecera ||
      !Array.isArray(body.detalle) ||
      body.detalle.length === 0
    ) {
      return Response.json(
        { message: "La cabecera y el detalle del pedido son obligatorios" },
        { status: 400 },
      );
    }

    const cabecera = body.cabecera as IPedidoCabeceraForm;
    const detalle = body.detalle as IPedidoDetalleForm[];

    if (
      !cabecera.fchdoc ||
      !cabecera.fch_ent ||
      !cabecera.codmon ||
      !cabecera.nomaux ||
      !cabecera.diraux ||
      !cabecera.rucaux ||
      cabecera.id_clie == null ||
      cabecera.id_ven == null ||
      cabecera.for_pago == null ||
      cabecera.usuario == null
    ) {
      return Response.json(
        { message: "Faltan datos obligatorios del pedido" },
        { status: 400 },
      );
    }

    const fechaPedido = new Date(cabecera.fchdoc);
    const fechaEntrega = new Date(cabecera.fch_ent);

    if (
      Number.isNaN(fechaPedido.getTime()) ||
      Number.isNaN(fechaEntrega.getTime())
    ) {
      return Response.json(
        { message: "Las fechas del pedido no son válidas" },
        { status: 400 },
      );
    }

    const ano = String(fechaPedido.getUTCFullYear());
    const mes = String(fechaPedido.getUTCMonth() + 1).padStart(2, "0");

    const resultado = await prisma.$transaction(async (tx) => {
      const pedidoExistente = await tx.pedidoCabecera.findUnique({
        where: { id_ped: idPed },
        select: {
          id_ped: true,
          estado: true,
        },
      });

      if (!pedidoExistente) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
      }

      if (!estadosModificables.includes(pedidoExistente.estado)) {
        throw new Error("PEDIDO_NO_MODIFICABLE");
      }

      await tx.pedidoCabecera.update({
        where: { id_ped: idPed },
        data: {
          ano,
          mes,
          fchdoc: fechaPedido,
          fch_ent: fechaEntrega,
          id_clie: cabecera.id_clie!,
          id_ven: cabecera.id_ven!,
          for_pago: cabecera.for_pago!,
          usuario: cabecera.usuario!,
          id_cot: cabecera.id_cot,
          codmon: cabecera.codmon,
          tpocmb: cabecera.tpocmb,
          nomaux: cabecera.nomaux,
          diraux: cabecera.diraux,
          rucaux: cabecera.rucaux,
          ocompra: cabecera.ocompra,
          flg_incigv: cabecera.flg_incigv,
          porigv: cabecera.porigv,
          impbto: cabecera.impbto,
          impigv: cabecera.impigv,
          imptot: cabecera.imptot,
          glosa: cabecera.glosa,
        },
      });

      await tx.pedidoDetalle.deleteMany({
        where: { id_ped: idPed },
      });

      await tx.pedidoDetalle.createMany({
        data: detalle.map((item) => ({
          id_ped: idPed,
          id_art: item.id_art,
          id_umedr: item.id_umedr,
          nroitm: item.nroitm,
          cod_art: item.cod_art,
          des_art: item.des_art,
          des_ar1: item.des_ar1,
          des_ar2: item.des_ar2,
          des_ar3: item.des_ar3,
          des_ar4: item.des_ar4,
          des_ar5: item.des_ar5,
          des_ar6: item.des_ar6,
          des_ar7: item.des_ar7,
          des_ar8: item.des_ar8,
          can_art: item.can_art,
          factor: item.factor,
          operador: item.operador,
          alias_umed: item.alias_umed,
          pre_art: item.pre_art,
          pdes_art: item.pdes_art,
          igv_art: item.igv_art,
          pu_conigv: item.pu_conigv,
          pu_sinigv: item.pu_sinigv,
          pu_des: item.pu_des,
          subtot_art: item.subtot_art,
          tot_art: item.tot_art,
        })),
      });

      return tx.pedidoCabecera.findUnique({
        where: { id_ped: idPed },
        select: {
          id_ped: true,
          nrodoc: true,
        },
      });
    });

    return Response.json({
      message: `Pedido ${resultado?.nrodoc ?? ""} actualizado correctamente`,
      data: resultado,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PEDIDO_NO_ENCONTRADO") {
        return Response.json(
          { message: "Pedido no encontrado" },
          { status: 404 },
        );
      }

      if (error.message === "PEDIDO_NO_MODIFICABLE") {
        return Response.json(
          { message: "Solo se pueden modificar pedidos ingresados" },
          { status: 409 },
        );
      }
    }

    return Response.json(
      { message: "Error al actualizar el pedido" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const idPed = await obtenerId(context);

    if (!idPed) {
      return Response.json(
        { message: "El ID del pedido no es válido" },
        { status: 400 },
      );
    }

    const pedido = await prisma.$transaction(async (tx) => {
      const existente = await tx.pedidoCabecera.findUnique({
        where: { id_ped: idPed },
        select: {
          id_ped: true,
          nrodoc: true,
          estado: true,
        },
      });

      if (!existente) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
      }

      if (!estadosModificables.includes(existente.estado)) {
        throw new Error("PEDIDO_NO_ELIMINABLE");
      }

      await tx.pedidoDetalle.deleteMany({
        where: { id_ped: idPed },
      });

      await tx.pedidoCabecera.delete({
        where: { id_ped: idPed },
      });

      return existente;
    });

    return Response.json({
      message: `Pedido ${pedido.nrodoc} eliminado correctamente`,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PEDIDO_NO_ENCONTRADO") {
        return Response.json(
          { message: "Pedido no encontrado" },
          { status: 404 },
        );
      }

      if (error.message === "PEDIDO_NO_ELIMINABLE") {
        return Response.json(
          { message: "Solo se pueden eliminar pedidos ingresados" },
          { status: 409 },
        );
      }
    }

    return Response.json(
      { message: "Error al eliminar el pedido" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const idPed = await obtenerId(context);

    if (!idPed) {
      return Response.json(
        { message: "El ID del pedido no es válido" },
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

    if (accion !== "aprobar" && accion !== "anular") {
      return Response.json({ message: "Acción no válida" }, { status: 400 });
    }

    const pedido = await prisma.$transaction(async (tx) => {
      const existente = await tx.pedidoCabecera.findUnique({
        where: { id_ped: idPed },
        select: {
          id_ped: true,
          nrodoc: true,
          estado: true,
        },
      });

      if (!existente) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
      }

      if (accion === "aprobar" && existente.estado !== "INGRESADO") {
        throw new Error("PEDIDO_NO_APROBABLE");
      }

      if (
        accion === "anular" &&
        !["INGRESADO", "APROBADO"].includes(existente.estado)
      ) {
        throw new Error("PEDIDO_NO_ANULABLE");
      }

      return tx.pedidoCabecera.update({
        where: { id_ped: idPed },
        data:
          accion === "aprobar"
            ? {
                estado: "APROBADO",
                flg_aprob: true,
                fch_aprob: new Date(),
                usuario_aprob: userId,
              }
            : {
                estado: "ANULADO",
                flg_anu: true,
                fch_anu: new Date(),
                usuario_anu: userId,
              },
        select: {
          id_ped: true,
          nrodoc: true,
          estado: true,
        },
      });
    });

    return Response.json({
      message: `Pedido ${pedido.nrodoc} ${
        accion === "aprobar" ? "aprobado" : "anulado"
      } correctamente`,
      data: pedido,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PEDIDO_NO_ENCONTRADO") {
        return Response.json(
          { message: "Pedido no encontrado" },
          { status: 404 },
        );
      }

      if (
        error.message === "PEDIDO_NO_APROBABLE" ||
        error.message === "PEDIDO_NO_ANULABLE"
      ) {
        return Response.json(
          { message: "El estado actual del pedido no permite esta acción" },
          { status: 409 },
        );
      }
    }

    return Response.json(
      { message: "Error al actualizar el estado del pedido" },
      { status: 500 },
    );
  }
}
