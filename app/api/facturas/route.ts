import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  FacturacionCabecera,
  FacturacionDetalle,
} from "@/app/(protected)/movimientos/facturacion/types";
import { Prisma } from "@/app/generated/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const cabecera = body.cabecera as FacturacionCabecera;
    const detalle = body.detalle as FacturacionDetalle[];

    if (!cabecera || !Array.isArray(detalle) || detalle.length === 0) {
      return NextResponse.json(
        { message: "Datos de facturación incompletos" },
        { status: 400 },
      );
    }

    if (
      !cabecera.ano ||
      !cabecera.codalm ||
      !cabecera.codmon ||
      !cabecera.id_tipdoc ||
      !cabecera.ser_doc ||
      !cabecera.fchdoc ||
      !cabecera.fchvto
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
      // Generar número de factura
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(73002149)::text`;

      const existingNumbers = await tx.facturacionCabecera.findMany({
        select: { num_doc: true },
      });

      const numerosValidos = existingNumbers
        .map((item) => item.num_doc)
        .filter(
          (numero): numero is string => numero !== null && /^\d+$/.test(numero),
        );

      const maxNumber = numerosValidos.reduce(
        (max, numero) => Math.max(max, Number(numero)),
        0,
      );

      const maxLength = Math.max(
        7,
        ...numerosValidos.map((numero) => numero.length),
      );

      const num_doc = String(maxNumber + 1).padStart(maxLength, "0");

      // Validar y actualizar pedidos
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(73002147)::text`;

      const pedidosPorId = new Map<number, number[]>();

      for (const item of detalle) {
        if (item.id_alm !== null) {
          if (item.itmalm === null) {
            throw new Error("DETALLE_REMISION_INVALIDO");
          }

          const remisionDetalle = await tx.guiaRemisionDetalle.findUnique({
            where: {
              id_remision_nroitm: {
                id_remision: item.id_alm,
                nroitm: item.itmalm,
              },
            },
          });

          if (!remisionDetalle) {
            throw new Error("DETALLE_REMISION_NO_EXISTE");
          }

          if (remisionDetalle.id_art !== item.id_art) {
            throw new Error("ARTICULO_REMISION_INVALIDO");
          }
        } else if (item.id_ped !== null) {
          if (item.itmped === null || item.id_alm !== null) {
            throw new Error("DETALLE_PEDIDO_INVALIDO");
          }

          const items = pedidosPorId.get(item.id_ped) ?? [];
          items.push(item.nroitm);
          pedidosPorId.set(item.id_ped, items);
        } else if (item.itmped !== null || item.itmalm !== null) {
          throw new Error("DETALLE_ORIGEN_INVALIDO");
        }
      }

      for (const [id_ped] of pedidosPorId) {
        const pedido = await tx.pedidoCabecera.findUnique({
          where: { id_ped },
          include: { detalles: true },
        });

        if (!pedido) {
          throw new Error("PEDIDO_NO_EXISTE");
        }

        if (pedido.estado === "ANULADO" || pedido.estado === "ATENDIDO") {
          throw new Error("PEDIDO_NO_DISPONIBLE");
        }

        const cantidadesPorItem = new Map<number, number>();

        for (const item of detalle) {
          if (item.id_ped !== id_ped) continue;

          const nroitm = item.itmped!;

          cantidadesPorItem.set(
            nroitm,
            (cantidadesPorItem.get(nroitm) ?? 0) + item.can_art,
          );
        }

        for (const [nroitm, cantidadSolicitada] of cantidadesPorItem) {
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

          const actualizado = await tx.pedidoDetalle.updateMany({
            where: {
              id_ped,
              nroitm,
              can_ate: {
                lte: pedidoDetalle.can_art - cantidadSolicitada,
              },
            },
            data: {
              can_ate: { increment: cantidadSolicitada },
            },
          });

          if (actualizado.count === 0) {
            throw new Error("CANTIDAD_SUPERA_PEDIDO");
          }
        }
      }

      // Decrementar stock de detalles independientes
      const cantidadesPorArticulo = new Map<number, number>();

      for (const item of detalle) {
        if (item.id_ped === null && item.id_alm === null) {
          cantidadesPorArticulo.set(
            item.id_art,
            (cantidadesPorArticulo.get(item.id_art) ?? 0) + item.can_art,
          );
        }
      }

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

      // Registrar factura
      const factura = await tx.facturacionCabecera.create({
        data: {
          ano: cabecera.ano,
          codalm: cabecera.codalm,
          codmon: cabecera.codmon,
          diavto: cabecera.diavto,
          diraux: cabecera.diraux,
          fchcob: cabecera.fchcob ? new Date(cabecera.fchcob) : null,
          fchdoc: new Date(cabecera.fchdoc),
          fchvto: new Date(cabecera.fchvto),
          flg_incigv: cabecera.flg_incigv,
          for_pago: cabecera.for_pago,
          id_aux: cabecera.id_aux,
          id_ped: cabecera.id_ped,
          id_remision: cabecera.id_remision,
          id_tipdoc: cabecera.id_tipdoc,
          id_ven: cabecera.id_ven,
          impadel: cabecera.impadel,
          impigv: cabecera.impigv,
          impsbt: cabecera.impsbt,
          imptot: cabecera.imptot,
          monto_a: cabecera.monto_a,
          monto_i: cabecera.monto_i,
          nomaux: cabecera.nomaux,
          nro_ped: cabecera.nro_ped,
          nromes: cabecera.nromes,
          num_doc,
          ocompra: cabecera.ocompra,
          porigv: cabecera.porigv,
          rucaux: cabecera.rucaux,
          sdodoc: cabecera.sdodoc,
          ser_doc: cabecera.ser_doc,
          tipo: cabecera.tipo,
          tpocmb: cabecera.tpocmb,
          usuario: cabecera.usuario,
          detalles: {
            create: detalle.map((item) => ({
              nroitm: item.nroitm,
              id_art: item.id_art,
              cod_art: item.cod_art,
              des_art: item.des_art,
              id_umedr: item.id_umedr,
              factor: item.factor,
              can_art: item.can_art,
              pre_art: item.pre_art,
              pdes_art: item.pdes_art,
              pu_des: item.pu_des,
              tot_art: item.tot_art,
              des_ar1: item.des_ar1,
              des_ar2: item.des_ar2,
              des_ar3: item.des_ar3,
              des_ar4: item.des_ar4,
              des_ar5: item.des_ar5,
              des_ar6: item.des_ar6,
              des_ar7: item.des_ar7,
              des_ar8: item.des_ar8,
              subtot_art: item.subtot_art,
              igv_art: item.igv_art,
              pu_conigv: item.pu_conigv,
              pu_sinigv: item.pu_sinigv,
              operador: item.operador,
              id_ped: item.id_ped,
              itmped: item.itmped,
              nroped: item.nroped,
              id_alm: item.id_alm,
              itmalm: item.itmalm,
              nroalm: item.nroalm,
            })),
          },
        },
      });

      // Actualizar estado de los pedidos utilizados
      for (const [id_ped] of pedidosPorId) {
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

      return factura;
    });

    return NextResponse.json(
      {
        message: "Factura registrada correctamente",
        id_cpc: result.id_cpc,
      },
      { status: 201 },
    );
  } catch (error) {
    const errorMessages: Record<string, string> = {
      DETALLE_ORIGEN_INVALIDO:
        "Un detalle no puede tener simultáneamente un pedido y una remisión",
      DETALLE_PEDIDO_INVALIDO:
        "Un detalle del pedido contiene referencias inválidas",
      DETALLE_REMISION_INVALIDO:
        "Un detalle de remisión contiene referencias inválidas",
      PEDIDO_NO_EXISTE: "El pedido indicado no existe",
      PEDIDO_NO_DISPONIBLE: "El pedido no está disponible para facturación",
      DETALLE_PEDIDO_NO_EXISTE: "Un detalle indicado no existe en el pedido",
      CANTIDAD_SUPERA_PEDIDO:
        "La cantidad supera la cantidad pendiente del pedido",
      DETALLE_REMISION_NO_EXISTE:
        "El detalle indicado no existe en la remisión",
      ARTICULO_REMISION_INVALIDO:
        "El artículo no corresponde al detalle de la remisión",
      STOCK_INSUFICIENTE: "Stock insuficiente para registrar la factura",
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

    let where: Prisma.FacturacionCabeceraWhereInput = {};

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
        ano,
        nromes: String(numeroMes).padStart(2, "0"),
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

    const facturas = await prisma.facturacionCabecera.findMany({
      where,
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
        fch_ing: true,
        fch_anu: true,
        flg_incigv: true,
        flg_anu: true,
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
        usuario_anu: true,
        estado: true,
        metodoPago: {
          select: { forma_pago: true },
        },
        pedido: {
          select: { nrodoc: true },
        },
        remision: {
          select: {
            id_remision: true,
            serie: true,
            numero: true,
            flg_anu: true,
            estado: true,
          },
        },
        remisiones: {
          where: {
            flg_anu: false,
            estado: { not: "ANULADO" },
          },
          orderBy: {
            fch_ing: "desc",
          },
          select: {
            id_remision: true,
            serie: true,
            numero: true,
          },
        },
        usuarioReg: {
          select: { username: true },
        },
      },
      orderBy: {
        num_doc: "desc",
      },
    });

    const data = facturas.map(
      ({
        metodoPago,
        pedido,
        remision,
        remisiones,
        usuarioReg,
        ...factura
      }) => {
        const remisionDesdeEstaFactura = remisiones[0] ?? null;
        const remisionOrigenActiva =
          remision && !remision.flg_anu && remision.estado !== "ANULADO"
            ? remision
            : null;

        const remisionVinculada =
          remisionDesdeEstaFactura ?? remisionOrigenActiva;

        return {
          ...factura,
          id_remision:
            remisionVinculada?.id_remision ?? factura.id_remision ?? null,
          impadel: Number(factura.impadel),
          impigv: Number(factura.impigv),
          impsbt: Number(factura.impsbt),
          imptot: Number(factura.imptot),
          monto_a: Number(factura.monto_a),
          monto_i: Number(factura.monto_i),
          porigv: Number(factura.porigv),
          sdodoc: Number(factura.sdodoc),
          tpocmb: Number(factura.tpocmb),
          formapago: metodoPago?.forma_pago ?? null,
          guia_remision: remisionVinculada ? remisionVinculada.numero : null,
          pedido: pedido?.nrodoc ?? null,
          usuario_ing: usuarioReg?.username ?? "",
        };
      },
    );

    return Response.json({ data });
  } catch (error) {
    console.error("Error al listar facturas:", error);

    return Response.json(
      { message: "Error al listar las facturas" },
      { status: 500 },
    );
  }
}
