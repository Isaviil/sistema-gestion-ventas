import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  IGuiaRemisionCabecera,
  IGuiaRemisionDetalles,
} from "@/app/(protected)/movimientos/guia-remision/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const cabecera = body.cabecera as IGuiaRemisionCabecera;
    const detalle = body.detalle as IGuiaRemisionDetalles[];

    if (!cabecera || !Array.isArray(detalle) || detalle.length === 0) {
      return NextResponse.json(
        { message: "Datos de remisión incompletos" },
        { status: 400 },
      );
    }

    if (
      !cabecera.serie ||
      !cabecera.ano ||
      !cabecera.mes ||
      !cabecera.codalm ||
      !cabecera.codmov ||
      !cabecera.codmon ||
      cabecera.bultos <= 0 ||
      cabecera.peso <= 0
    ) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios de la cabecera" },
        { status: 400 },
      );
    }

    if (
      detalle.some(
        (item) =>
          !item.id_art ||
          !item.id_umedr ||
          !item.can_art ||
          item.can_art <= 0 ||
          !item.nroitm,
      )
    ) {
      return NextResponse.json(
        { message: "Los detalles contienen datos inválidos" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Generar número de remisión
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(73002148)::text`;

      const existingNumbers = await tx.guiaRemisionCabecera.findMany({
        select: { numero: true },
      });

      const maxNumber = existingNumbers.reduce((max, row) => {
        if (!/^\d{7}$/.test(row.numero)) return max;

        return Math.max(max, Number(row.numero));
      }, 0);

      if (maxNumber >= 9_999_999) {
        throw new Error("NUMERO_DOCUMENTO_AGOTADO");
      }

      const numero = String(maxNumber + 1).padStart(7, "0");

      // Validar orígenes de detalle sin tocar stock/can_ate cuando viene de factura
      const cantidadesPorItemPedido = new Map<number, number>();
      const cantidadesPorArticulo = new Map<number, number>();
      let tieneOrigenPedidoDirecto = false;

      for (const item of detalle) {
        if (item.id_cpc != null) {
          if (cabecera.id_cpc !== item.id_cpc || item.itmcpc == null) {
            throw new Error("DETALLE_FACTURA_INVALIDO");
          }
          continue;
        }

        if (item.id_ped != null) {
          if (cabecera.id_ped !== item.id_ped || item.itmped == null) {
            throw new Error("DETALLE_PEDIDO_INVALIDO");
          }

          tieneOrigenPedidoDirecto = true;
          cantidadesPorItemPedido.set(
            item.itmped,
            (cantidadesPorItemPedido.get(item.itmped) ?? 0) + item.can_art,
          );
          continue;
        }

        cantidadesPorArticulo.set(
          item.id_art,
          (cantidadesPorArticulo.get(item.id_art) ?? 0) + item.can_art,
        );
      }

      // Validar y actualizar Pedido solo cuando la remisión atiende pedido directo
      if (tieneOrigenPedidoDirecto && cabecera.id_ped != null) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(73002147)::text`;

        const pedido = await tx.pedidoCabecera.findUnique({
          where: { id_ped: cabecera.id_ped },
          include: { detalles: true },
        });

        if (!pedido) {
          throw new Error("PEDIDO_NO_EXISTE");
        }

        if (pedido.estado === "ANULADO" || pedido.estado === "ATENDIDO") {
          throw new Error("PEDIDO_NO_DISPONIBLE");
        }

        for (const [nroitm, cantidadSolicitada] of cantidadesPorItemPedido) {
          const pedidoDetalle = pedido.detalles.find(
            (item) => item.nroitm === nroitm,
          );

          if (!pedidoDetalle) {
            throw new Error("DETALLE_PEDIDO_NO_EXISTE");
          }

          const pendiente = pedidoDetalle.can_art - pedidoDetalle.can_ate;

          if (cantidadSolicitada > pendiente) {
            throw new Error("CANTIDAD_SUPERA_PEDIDO");
          }

          await tx.pedidoDetalle.update({
            where: {
              id_ped_nroitm: {
                id_ped: cabecera.id_ped,
                nroitm,
              },
            },
            data: {
              can_ate: { increment: cantidadSolicitada },
            },
          });
        }
      }

      // Descontar stock solo para detalles sin origen de pedido ni factura
      for (const [id_art, cantidad] of cantidadesPorArticulo) {
        const actualizado = await tx.product.updateMany({
          where: {
            id_art,
            stkact: { gte: cantidad },
          },
          data: {
            stkact: { decrement: cantidad },
          },
        });

        if (actualizado.count === 0) {
          throw new Error("STOCK_INSUFICIENTE");
        }
      }

      const remision = await tx.guiaRemisionCabecera.create({
        data: {
          almdes: cabecera.almdes,
          almori: cabecera.almori,
          ano: cabecera.ano,
          bultos: cabecera.bultos,
          codalm: cabecera.codalm,
          codmon: cabecera.codmon!,
          codmov: cabecera.codmov,
          dirent: cabecera.dirent,
          fchdoc: new Date(cabecera.fchdoc),
          fchtras: new Date(cabecera.fchtras),
          flg_incigv: cabecera.flg_incigv,
          for_pago: cabecera.for_pago,
          glosa: cabecera.glosa,
          id_aux: cabecera.id_aux,
          id_chof: cabecera.id_chof,
          id_ped: cabecera.id_ped,
          id_cpc: cabecera.id_cpc,
          id_transp: cabecera.id_transp,
          id_vehi: cabecera.id_vehi,
          id_ven: cabecera.id_ven,
          mes: cabecera.mes,
          nomaux: cabecera.nomaux,
          numero,
          peso: cabecera.peso,
          porigv: cabecera.porigv,
          ptopartida: cabecera.ptopartida!,
          rucaux: cabecera.rucaux!,
          serie: cabecera.serie,
          tpocmb: cabecera.tpocmb,
          ubigeo1: cabecera.ubigeo1!,
          ubigeo2: cabecera.ubigeo2!,
          usuario: cabecera.usuario,
          detalles: {
            create: detalle.map((item) => ({
              can_art: item.can_art,
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
              factor: item.factor,
              id_art: item.id_art,
              id_cpc: item.id_cpc,
              id_ped: item.id_ped,
              id_umedr: item.id_umedr,
              igv_art: item.igv_art,
              itmcpc: item.itmcpc,
              itmped: item.itmped,
              nrocpc: item.nrocpc,
              nroitm: item.nroitm,
              nroped: item.nroped,
              operador: item.operador,
              pdes_art: item.pdes_art,
              pre_art: item.pre_art,
              pu_conigv: item.pu_conigv,
              pu_des: item.pu_des,
              pu_sinigv: item.pu_sinigv,
              subtot_art: item.subtot_art,
              tot_art: item.tot_art,
            })),
          },
        },
      });

      // Actualizar estado del Pedido solo si hubo atención directa de pedido
      if (tieneOrigenPedidoDirecto && cabecera.id_ped != null) {
        const pedidoDetalles = await tx.pedidoDetalle.findMany({
          where: { id_ped: cabecera.id_ped },
        });

        const atendido = pedidoDetalles.every(
          (item) => item.can_ate >= item.can_art,
        );

        const algunoAtendido = pedidoDetalles.some((item) => item.can_ate > 0);

        await tx.pedidoCabecera.update({
          where: { id_ped: cabecera.id_ped },
          data: {
            estado: atendido
              ? "ATENDIDO"
              : algunoAtendido
                ? "PARCIAL"
                : "INGRESADO",
          },
        });
      }

      return remision;
    });

    return NextResponse.json(
      {
        message: "Remisión registrada correctamente",
        id_remision: result.id_remision,
      },
      { status: 201 },
    );
  } catch (error) {
    const errorMessages: Record<string, string> = {
      PEDIDO_NO_EXISTE: "El pedido indicado no existe",
      PEDIDO_NO_DISPONIBLE: "El pedido no está disponible para remisión",
      DETALLE_PEDIDO_INVALIDO: "Un detalle no corresponde al pedido indicado",
      DETALLE_PEDIDO_NO_EXISTE: "Un detalle indicado no existe en el pedido",
      CANTIDAD_SUPERA_PEDIDO:
        "La cantidad supera la cantidad pendiente del pedido",
      STOCK_INSUFICIENTE: "Stock insuficiente para registrar la remisión",
      NUMERO_DOCUMENTO_AGOTADO:
        "Se alcanzó el límite de numeración de remisiones",
      DETALLE_FACTURA_INVALIDO:
        "Un detalle no corresponde a la factura indicada",
    };

    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json(
      {
        message: errorMessages[message] ?? message,
      },
      {
        status: errorMessages[message] ? 400 : 500,
      },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const tipoFiltro = searchParams.get("ft");
    const ano = searchParams.get("ano");
    const mes = searchParams.get("mes");
    const fechaInicio = searchParams.get("start");
    const fechaFin = searchParams.get("end");

    type WhereCondition = {
      ano?: string;
      mes?: string;
      fchdoc?: {
        gte: Date;
        lt: Date;
      };
    };

    let where: WhereCondition = {};

    if (tipoFiltro === "year_month") {
      if (!ano || !mes) {
        return Response.json(
          { message: "El año y el mes son obligatorios" },
          { status: 400 },
        );
      }

      if (!/^\d{4}$/.test(ano) || !/^\d{1,2}$/.test(mes)) {
        return Response.json(
          { message: "El año o el mes no son válidos" },
          { status: 400 },
        );
      }

      const numeroMes = Number(mes);

      if (numeroMes < 1 || numeroMes > 12) {
        return Response.json(
          { message: "El mes debe estar entre 1 y 12" },
          { status: 400 },
        );
      }

      where = {
        ...where,
        ano,
        mes: String(numeroMes).padStart(2, "0"),
      };
    } else if (tipoFiltro === "date_range") {
      if (
        !fechaInicio ||
        !fechaFin ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)
      ) {
        return Response.json(
          { message: "El rango de fechas no es válido" },
          { status: 400 },
        );
      }

      const inicio = new Date(`${fechaInicio}T00:00:00.000Z`);
      const fin = new Date(`${fechaFin}T00:00:00.000Z`);

      if (
        Number.isNaN(inicio.getTime()) ||
        Number.isNaN(fin.getTime()) ||
        inicio.toISOString().slice(0, 10) !== fechaInicio ||
        fin.toISOString().slice(0, 10) !== fechaFin ||
        inicio > fin
      ) {
        return Response.json(
          { message: "El rango de fechas no es válido" },
          { status: 400 },
        );
      }

      fin.setUTCDate(fin.getUTCDate() + 1);

      where = {
        ...where,
        fchdoc: {
          gte: inicio,
          lt: fin,
        },
      };
    } else {
      return Response.json(
        { message: "El tipo de filtro no es válido" },
        { status: 400 },
      );
    }

    const remisiones = await prisma.guiaRemisionCabecera.findMany({
      where,
      select: {
        id_remision: true,
        ano: true,
        mes: true,
        codmon: true,
        dirent: true,
        id_cpc: true,
        facturas: {
          where: {
            flg_anu: false,
            estado: { not: "ANULADO" },
          },
          select: {
            id_cpc: true,
            id_ped: true,
            num_doc: true,
            flg_anu: true,
            estado: true,
            pedido: {
              select: { nrodoc: true },
            },
          },
        },
        factura: {
          where: {
            flg_anu: false,
            estado: { not: "ANULADO" },
          },
          orderBy: {
            id_cpc: "desc",
          },
          select: {
            id_cpc: true,
            id_ped: true,
            num_doc: true,
            flg_anu: true,
            estado: true,
            pedido: {
              select: { nrodoc: true },
            },
          },
        },
        fch_ing: true,
        fch_anu: true,
        fchdoc: true,
        flg_anu: true,
        flg_incigv: true,
        for_pago: true,
        glosa: true,
        id_aux: true,
        id_ped: true,
        id_ven: true,
        nomaux: true,
        numero: true,
        porigv: true,
        rucaux: true,
        serie: true,
        tpocmb: true,
        usuario: true,
        usuario_anu: true,
        estado: true,
        metodoPago: {
          select: { forma_pago: true },
        },
        pedido: {
          select: { nrodoc: true },
        },
        usuarioReg: {
          select: { username: true },
        },
      },
      orderBy: {
        numero: "desc",
      },
    });

    const data = remisiones.map(
      ({ metodoPago, pedido, usuarioReg, facturas, factura, ...remision }) => {
        const facturaActiva = facturas ?? factura[0] ?? null;
        const nroPedidoBase =
          pedido?.nrodoc ?? facturaActiva?.pedido?.nrodoc ?? null;

        return {
          ...remision,
          porigv: Number(remision.porigv),
          tpocmb: Number(remision.tpocmb),
          id_cpc: facturaActiva?.id_cpc ?? null,
          id_ped: remision.id_ped ?? facturaActiva?.id_ped ?? null,
          factura: facturaActiva?.num_doc ?? null,
          formapago: metodoPago?.forma_pago ?? null,
          pedido: nroPedidoBase ? `${remision.ano}-${nroPedidoBase}` : null,
          usuario_ing: usuarioReg?.username ?? "",
          fch_anu: remision.fch_anu ? remision.fch_anu.toISOString() : null,
        };
      },
    );

    return Response.json({ data });
  } catch (error) {
    console.error("Error al listar guías de remisión:", error);

    return Response.json(
      { message: "Error al listar las guías de remisión" },
      { status: 500 },
    );
  }
}
