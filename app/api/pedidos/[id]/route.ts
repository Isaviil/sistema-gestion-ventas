import { prisma } from "@/app/lib/prisma";
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
        usuarioAprueba: true,
        usuarioAnula: true,
        usuarioCierra: true,
        remisiones: {
          where: { flg_anu: false, estado: { not: "ANULADO" } },
          orderBy: { id_remision: "asc" },
          select: {
            numero: true,
          },
        },
        facturas: {
          where: { flg_anu: false, estado: { not: "ANULADO" } },
          orderBy: { id_cpc: "asc" },
          select: {
            num_doc: true,
            remisiones: {
              where: { flg_anu: false, estado: { not: "ANULADO" } },
              orderBy: { id_remision: "asc" },
              select: {
                numero: true,
              },
            },
          },
        },
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

    const remisionesDesdeFacturas = pedido.facturas.flatMap(
      (fac) => fac.remisiones ?? [],
    );

    const numerosGuia = Array.from(
      new Set(
        [...pedido.remisiones, ...remisionesDesdeFacturas]
          .map((rem) => rem.numero?.trim())
          .filter((num): num is string => Boolean(num)),
      ),
    );

    const numerosFactura = Array.from(
      new Set(
        pedido.facturas
          .map((fac) => fac.num_doc?.trim())
          .filter((num): num is string => Boolean(num)),
      ),
    );

    const cabecera = {
      ano: pedido.ano,
      codmon: pedido.codmon,
      cotizacion: pedido.cotizacion,
      diraux: pedido.diraux,
      estado: pedido.estado,
      factura:
        numerosFactura.length > 0
          ? numerosFactura.join(", ")
          : (pedido.factura ?? null),
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
      guia_remision:
        numerosGuia.length > 0
          ? numerosGuia.join(", ")
          : (pedido.guia_remision ?? null),
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
      usuario_aprob: pedido.usuarioAprueba?.username ?? null,
      usuario_anu: pedido.usuarioAnula?.username ?? null,
      usuario_cie: pedido.usuarioCierra?.username ?? null,
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
    const cabecera = body?.cabecera;
    const detalle = body?.detalle;

    if (!cabecera || typeof cabecera !== "object" || Array.isArray(cabecera)) {
      return Response.json(
        { message: "La cabecera del pedido es obligatoria" },
        { status: 400 },
      );
    }

    if (!Array.isArray(detalle) || detalle.length === 0) {
      return Response.json(
        { message: "El pedido debe contener al menos un detalle" },
        { status: 400 },
      );
    }

    for (const field of ["id_clie", "id_ven", "for_pago", "usuario"]) {
      if (!Number.isInteger(cabecera[field]) || cabecera[field] <= 0) {
        return Response.json(
          { message: `El campo ${field} es obligatorio y debe ser válido` },
          { status: 400 },
        );
      }
    }

    for (const field of ["codmon", "nomaux", "diraux", "rucaux"]) {
      if (typeof cabecera[field] !== "string" || !cabecera[field].trim()) {
        return Response.json(
          { message: `El campo ${field} es obligatorio` },
          { status: 400 },
        );
      }
    }

    if (typeof cabecera.flg_incigv !== "boolean") {
      return Response.json(
        { message: "El campo flg_incigv debe ser booleano" },
        { status: 400 },
      );
    }

    const fechaPedido = new Date(cabecera.fchdoc);
    const fechaEntrega = new Date(cabecera.fch_ent);

    if (
      !cabecera.fchdoc ||
      Number.isNaN(fechaPedido.getTime()) ||
      !cabecera.fch_ent ||
      Number.isNaN(fechaEntrega.getTime())
    ) {
      return Response.json(
        { message: "Las fechas del pedido y de entrega deben ser válidas" },
        { status: 400 },
      );
    }

    for (const field of ["tpocmb", "porigv", "impbto", "impigv", "imptot"]) {
      if (
        typeof cabecera[field] !== "number" ||
        !Number.isFinite(cabecera[field])
      ) {
        return Response.json(
          { message: `El campo ${field} debe ser un número válido` },
          { status: 400 },
        );
      }
    }

    if (cabecera.tpocmb <= 0 || cabecera.porigv < 0) {
      return Response.json(
        { message: "El tipo de cambio y la tasa de IGV no son válidos" },
        { status: 400 },
      );
    }

    const itemNumbers = new Set<number>();

    const numericDetailFields = [
      "can_art",
      "factor",
      "pre_art",
      "pdes_art",
      "igv_art",
      "pu_conigv",
      "pu_sinigv",
      "pu_des",
      "subtot_art",
      "tot_art",
    ];

    const descriptiveFields = ["cod_art", "des_art", "alias_umed", "operador"];

    const optionalDescriptionFields = [
      "des_ar1",
      "des_ar2",
      "des_ar3",
      "des_ar4",
      "des_ar5",
      "des_ar6",
      "des_ar7",
      "des_ar8",
    ];

    for (const item of detalle) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return Response.json(
          { message: "Uno de los detalles del pedido no es válido" },
          { status: 400 },
        );
      }

      if (
        !Number.isInteger(item.nroitm) ||
        item.nroitm <= 0 ||
        itemNumbers.has(item.nroitm)
      ) {
        return Response.json(
          { message: "Los números de ítem deben ser únicos y válidos" },
          { status: 400 },
        );
      }

      if (!Number.isInteger(item.can_art) || item.can_art <= 0) {
        throw new Error("CANTIDAD_INVALIDA");
      }

      itemNumbers.add(item.nroitm);

      if (
        !Number.isInteger(item.id_art) ||
        item.id_art <= 0 ||
        !Number.isInteger(item.id_umedr) ||
        item.id_umedr <= 0
      ) {
        return Response.json(
          {
            message: `El artículo o la unidad del ítem ${item.nroitm} no son válidos`,
          },
          { status: 400 },
        );
      }

      if (
        numericDetailFields.some(
          (field) =>
            typeof item[field] !== "number" || !Number.isFinite(item[field]),
        )
      ) {
        return Response.json(
          {
            message: `Los valores numéricos del ítem ${item.nroitm} no son válidos`,
          },
          { status: 400 },
        );
      }

      if (
        item.factor <= 0 ||
        item.pre_art < 0 ||
        item.pdes_art < 0 ||
        item.pdes_art > 100 ||
        item.igv_art < 0 ||
        item.pu_conigv < 0 ||
        item.pu_sinigv < 0 ||
        item.pu_des < 0 ||
        item.subtot_art < 0 ||
        item.tot_art < 0
      ) {
        return Response.json(
          {
            message: `Los valores del ítem ${item.nroitm} deben ser válidos`,
          },
          { status: 400 },
        );
      }

      if (
        descriptiveFields.some(
          (field) => typeof item[field] !== "string" || !item[field].trim(),
        )
      ) {
        return Response.json(
          {
            message: `Faltan datos descriptivos del ítem ${item.nroitm}`,
          },
          { status: 400 },
        );
      }

      if (
        optionalDescriptionFields.some(
          (field) => item[field] != null && typeof item[field] !== "string",
        )
      ) {
        return Response.json(
          {
            message: `Las descripciones del ítem ${item.nroitm} no son válidas`,
          },
          { status: 400 },
        );
      }
    }

    const ano = String(fechaPedido.getUTCFullYear());
    const mes = String(fechaPedido.getUTCMonth() + 1).padStart(2, "0");

    const resultado = await prisma.$transaction(async (tx) => {
      const pedidoExistente = await tx.pedidoCabecera.findUnique({
        where: { id_ped: idPed },
        select: {
          id_ped: true,
          estado: true,
          detalles: {
            select: {
              nroitm: true,
              id_art: true,
              can_art: true,
              can_ate: true,
            },
          },
        },
      });

      if (!pedidoExistente) {
        throw new Error("PEDIDO_NO_ENCONTRADO");
      }

      if (!estadosModificables.includes(pedidoExistente.estado)) {
        throw new Error("PEDIDO_NO_MODIFICABLE");
      }

      const [cliente, vendedor, metodoPago, usuario] = await Promise.all([
        tx.customer.findUnique({
          where: { id_aux: cabecera.id_clie },
        }),
        tx.vendor.findUnique({
          where: { id_aux: cabecera.id_ven },
        }),
        tx.paymentMethod.findUnique({
          where: { for_pago: cabecera.for_pago },
        }),
        tx.user.findUnique({
          where: { id_usu: cabecera.usuario },
        }),
      ]);

      if (!cliente) throw new Error("CLIENTE_NO_EXISTE");
      if (!vendedor) throw new Error("VENDEDOR_NO_EXISTE");
      if (!metodoPago) throw new Error("FORMA_PAGO_NO_EXISTE");
      if (!usuario) throw new Error("USUARIO_NO_EXISTE");

      if (
        !cliente.flg_activo ||
        vendedor.flg_baja ||
        !metodoPago.flg_activo ||
        !usuario.flg_activo
      ) {
        throw new Error("REFERENCIA_INACTIVA");
      }

      for (const item of detalle) {
        const [producto, unidad] = await Promise.all([
          tx.product.findUnique({
            where: { id_art: item.id_art },
          }),
          tx.unitOfMeasure.findUnique({
            where: { id_umed: item.id_umedr },
          }),
        ]);

        if (!producto || !producto.flg_activo) {
          throw new Error("ARTICULO_NO_EXISTE");
        }

        if (producto.cod_art !== item.cod_art) {
          throw new Error(`CODIGO_ARTICULO_INCORRECTO:${item.nroitm}`);
        }

        if (!unidad) {
          throw new Error("UNIDAD_NO_EXISTE");
        }
      }

      // Serializar las operaciones que modifican stock.
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(73002146)::text
      `;

      const cantidadesAnteriores = new Map<number, number>();
      const cantidadesNuevas = new Map<number, number>();

      for (const item of pedidoExistente.detalles) {
        const cantidadReservada = item.can_art - item.can_ate;

        cantidadesAnteriores.set(
          item.id_art,
          (cantidadesAnteriores.get(item.id_art) ?? 0) + cantidadReservada,
        );
      }

      for (const item of detalle) {
        cantidadesNuevas.set(
          item.id_art,
          (cantidadesNuevas.get(item.id_art) ?? 0) + item.can_art,
        );
      }

      const idsArticulos = new Set([
        ...cantidadesAnteriores.keys(),
        ...cantidadesNuevas.keys(),
      ]);

      // Ajustar únicamente la diferencia de stock.
      for (const id_art of idsArticulos) {
        const diferencia =
          (cantidadesNuevas.get(id_art) ?? 0) -
          (cantidadesAnteriores.get(id_art) ?? 0);

        if (diferencia > 0) {
          const stockActualizado = await tx.product.updateMany({
            where: {
              id_art,
              stkact: { gte: diferencia },
            },
            data: {
              stkact: { decrement: diferencia },
            },
          });

          if (stockActualizado.count === 0) {
            throw new Error("STOCK_INSUFICIENTE");
          }
        } else if (diferencia < 0) {
          await tx.product.update({
            where: { id_art },
            data: {
              stkact: { increment: Math.abs(diferencia) },
            },
          });
        }
      }

      await tx.pedidoCabecera.update({
        where: { id_ped: idPed },
        data: {
          ano,
          mes,
          fchdoc: fechaPedido,
          fch_ent: fechaEntrega,
          id_clie: cabecera.id_clie,
          id_ven: cabecera.id_ven,
          for_pago: cabecera.for_pago,
          usuario: cabecera.usuario,
          id_cot: cabecera.id_cot,
          codmon: cabecera.codmon.trim(),
          tpocmb: cabecera.tpocmb,
          nomaux: cabecera.nomaux.trim(),
          diraux: cabecera.diraux.trim(),
          rucaux: cabecera.rucaux.trim(),
          ocompra: cabecera.ocompra?.trim() || null,
          flg_incigv: cabecera.flg_incigv,
          porigv: cabecera.porigv,
          impbto: cabecera.impbto,
          impigv: cabecera.impigv,
          imptot: cabecera.imptot,
          glosa: cabecera.glosa?.trim() || null,
        },
      });

      // Existing pedido details
      const nroitmExistentes = new Set(
        pedidoExistente.detalles.map((item) => item.nroitm),
      );

      const nroitmRecibidos = new Set(detalle.map((item) => item.nroitm));

      // Details that were removed from the request
      const nroitmEliminar = [...nroitmExistentes].filter(
        (nroitm) => !nroitmRecibidos.has(nroitm),
      );

      // Check whether removed details are referenced by any remisión
      if (nroitmEliminar.length > 0) {
        const referencias = await tx.guiaRemisionDetalle.findMany({
          where: {
            id_ped: idPed,
            itmped: { in: nroitmEliminar },
          },
          select: {
            itmped: true,
          },
        });

        if (referencias.length > 0) {
          throw new Error("DETALLE_CON_REMISION");
        }

        await tx.pedidoDetalle.deleteMany({
          where: {
            id_ped: idPed,
            nroitm: { in: nroitmEliminar },
          },
        });
      }

      // Update existing details or create new ones
      for (const item of detalle) {
        const existente = pedidoExistente.detalles.find(
          (d) => d.nroitm === item.nroitm,
        );

        if (existente) {
          if (item.can_art < existente.can_ate) {
            throw new Error("CANTIDAD_MENOR_A_LA_DESPACHADA");
          }

          await tx.pedidoDetalle.update({
            where: {
              id_ped_nroitm: {
                id_ped: idPed,
                nroitm: item.nroitm,
              },
            },
            data: {
              id_art: item.id_art,
              id_umedr: item.id_umedr,
              cod_art: item.cod_art.trim(),
              des_art: item.des_art.trim(),
              des_ar1: item.des_ar1 ?? null,
              des_ar2: item.des_ar2 ?? null,
              des_ar3: item.des_ar3 ?? null,
              des_ar4: item.des_ar4 ?? null,
              des_ar5: item.des_ar5 ?? null,
              des_ar6: item.des_ar6 ?? null,
              des_ar7: item.des_ar7 ?? null,
              des_ar8: item.des_ar8 ?? null,
              can_art: item.can_art,
              factor: item.factor,
              operador: item.operador.trim(),
              alias_umed: item.alias_umed.trim(),
              pre_art: item.pre_art,
              pdes_art: item.pdes_art,
              igv_art: item.igv_art,
              pu_conigv: item.pu_conigv,
              pu_sinigv: item.pu_sinigv,
              pu_des: item.pu_des,
              subtot_art: item.subtot_art,
              tot_art: item.tot_art,
            },
          });
        } else {
          await tx.pedidoDetalle.create({
            data: {
              id_ped: idPed,
              id_art: item.id_art,
              id_umedr: item.id_umedr,
              nroitm: item.nroitm,
              cod_art: item.cod_art.trim(),
              des_art: item.des_art.trim(),
              des_ar1: item.des_ar1 ?? null,
              des_ar2: item.des_ar2 ?? null,
              des_ar3: item.des_ar3 ?? null,
              des_ar4: item.des_ar4 ?? null,
              des_ar5: item.des_ar5 ?? null,
              des_ar6: item.des_ar6 ?? null,
              des_ar7: item.des_ar7 ?? null,
              des_ar8: item.des_ar8 ?? null,
              can_art: item.can_art,
              factor: item.factor,
              operador: item.operador.trim(),
              alias_umed: item.alias_umed.trim(),
              pre_art: item.pre_art,
              pdes_art: item.pdes_art,
              igv_art: item.igv_art,
              pu_conigv: item.pu_conigv,
              pu_sinigv: item.pu_sinigv,
              pu_des: item.pu_des,
              subtot_art: item.subtot_art,
              tot_art: item.tot_art,
              can_ate: 0,
            },
          });
        }
      }

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
    const message = error instanceof Error ? error.message : "";

    const errorMessages: Record<string, { message: string; status: number }> = {
      PEDIDO_NO_ENCONTRADO: {
        message: "Pedido no encontrado",
        status: 404,
      },
      PEDIDO_NO_MODIFICABLE: {
        message: "Solo se pueden modificar pedidos ingresados",
        status: 409,
      },
      STOCK_INSUFICIENTE: {
        message: "Stock insuficiente para actualizar el pedido",
        status: 400,
      },
      CANTIDAD_INVALIDA: {
        message: "La cantidad de los detalles debe ser válida",
        status: 400,
      },
      CLIENTE_NO_EXISTE: {
        message: "El cliente seleccionado no existe",
        status: 400,
      },
      VENDEDOR_NO_EXISTE: {
        message: "El vendedor seleccionado no existe",
        status: 400,
      },
      FORMA_PAGO_NO_EXISTE: {
        message: "La forma de pago seleccionada no existe",
        status: 400,
      },
      USUARIO_NO_EXISTE: {
        message: "El usuario seleccionado no existe",
        status: 400,
      },
      REFERENCIA_INACTIVA: {
        message: "Una de las referencias seleccionadas está inactiva",
        status: 400,
      },
      ARTICULO_NO_EXISTE: {
        message: "Uno de los artículos no existe o está inactivo",
        status: 400,
      },
      UNIDAD_NO_EXISTE: {
        message: "Una de las unidades de medida no existe",
        status: 400,
      },
    };

    if (errorMessages[message]) {
      const errorInfo = errorMessages[message];

      return Response.json(
        { message: errorInfo.message },
        { status: errorInfo.status },
      );
    }

    if (message.startsWith("CODIGO_ARTICULO_INCORRECTO:")) {
      const itemNumber = message.split(":")[1];

      return Response.json(
        {
          message: `El código del artículo del ítem ${itemNumber} no coincide con el artículo seleccionado`,
        },
        { status: 400 },
      );
    }

    console.error("Error al actualizar pedido:", error);

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
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(73002146)::text
      `;

      const existente = await tx.pedidoCabecera.findUnique({
        where: { id_ped: idPed },
        select: {
          id_ped: true,
          nrodoc: true,
          estado: true,
          detalles: {
            select: {
              nroitm: true,
              id_art: true,
              can_art: true,
              can_ate: true,
            },
          },
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

      const isAdmin =
        session.user.rol === "ADMIN" ||
        Boolean((session.user as { flg_admin?: boolean }).flg_admin);

      if (accion === "anular" && !isAdmin) {
        throw new Error("NO_PERMITIDO_ANULAR");
      }

      if (accion === "anular") {
        if (existente.estado !== "INGRESADO") {
          throw new Error("PEDIDO_NO_ANULABLE");
        }
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

      if (error.message === "NO_PERMITIDO_ANULAR") {
        return Response.json(
          { message: "No tienes permisos para anular pedidos" },
          { status: 403 },
        );
      }
    }

    return Response.json(
      { message: "Error al actualizar el estado del pedido" },
      { status: 500 },
    );
  }
}
