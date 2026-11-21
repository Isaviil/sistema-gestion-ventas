import { IPedidoDetalleForm } from "@/app/(protected)/movimientos/pedidos/types";
import { prisma } from "@/app/lib/prisma";

const errorMessages: Record<string, string> = {
  CLIENTE_NO_EXISTE: "El cliente indicado no existe",
  VENDEDOR_NO_EXISTE: "El vendedor indicado no existe",
  FORMA_PAGO_NO_EXISTE: "La forma de pago indicada no existe",
  USUARIO_NO_EXISTE: "El usuario indicado no existe",
  REFERENCIA_INACTIVA: "Una de las referencias está inactiva",
  ARTICULO_NO_EXISTE: "Uno de los artículos no existe o está inactivo",
  UNIDAD_NO_EXISTE: "Una de las unidades de medida no existe",
  NUMERO_DOCUMENTO_AGOTADO: "Se alcanzó el límite de numeración de pedidos",
  CANTIDAD_INVALIDA: "La cantidad debe ser un número entero mayor que cero",
  STOCK_INSUFICIENTE: "Stock insuficiente para uno de los artículos",
};

export async function POST(request: Request) {
  try {
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

    const fchdoc = new Date(cabecera.fchdoc);
    const fch_ent = new Date(cabecera.fch_ent);

    if (
      !cabecera.fchdoc ||
      Number.isNaN(fchdoc.getTime()) ||
      !cabecera.fch_ent ||
      Number.isNaN(fch_ent.getTime())
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
          { message: `Los valores del ítem ${item.nroitm} deben ser válidos` },
          { status: 400 },
        );
      }

      if (
        descriptiveFields.some(
          (field) => typeof item[field] !== "string" || !item[field].trim(),
        )
      ) {
        return Response.json(
          { message: `Faltan datos descriptivos del ítem ${item.nroitm}` },
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

    const ano = String(fchdoc.getUTCFullYear());
    const mes = String(fchdoc.getUTCMonth() + 1).padStart(2, "0");

    const result = await prisma.$transaction(async (tx) => {
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

      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(73002146)::text
      `;

      const existingNumbers = await tx.pedidoCabecera.findMany({
        select: { nrodoc: true },
      });

      const maxNumber = existingNumbers.reduce((max, row) => {
        if (!/^\d{7}$/.test(row.nrodoc)) return max;

        return Math.max(max, Number(row.nrodoc));
      }, 0);

      if (maxNumber >= 9_999_999) {
        throw new Error("NUMERO_DOCUMENTO_AGOTADO");
      }

      const cantidadesPorArticulo = new Map<number, number>();

      for (const item of detalle) {
        const cantidadActual = cantidadesPorArticulo.get(item.id_art) ?? 0;

        cantidadesPorArticulo.set(item.id_art, cantidadActual + item.can_art);
      }

      // Descontar stock disponible
      for (const [id_art, cantidad] of cantidadesPorArticulo) {
        const resultado = await tx.product.updateMany({
          where: {
            id_art,
            stkact: { gte: cantidad },
          },
          data: {
            stkact: { decrement: cantidad },
          },
        });

        if (resultado.count === 0) {
          throw new Error("STOCK_INSUFICIENTE");
        }
      }

      const nrodoc = String(maxNumber + 1).padStart(7, "0");

      const pedido = await tx.pedidoCabecera.create({
        data: {
          nrodoc,
          ano,
          mes,
          fchdoc,
          fch_ent,

          id_clie: cabecera.id_clie,
          id_ven: cabecera.id_ven,
          for_pago: cabecera.for_pago,
          usuario: cabecera.usuario,

          id_cot: cabecera.id_cot ?? null,
          cotizacion: cabecera.cotizacion?.trim() || null,

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

          flg_anu: false,
          flg_aprob: false,
          fch_anu: null,
          fch_aprob: null,
          fch_ate: null,
          usuario_anu: null,
          usuario_aprob: null,
          usuario_cie: null,

          detalles: {
            create: detalle.map((item: IPedidoDetalleForm) => ({
              nroitm: item.nroitm,
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
            })),
          },
        },
        include: {
          cliente: true,
          vendedor: true,
          metodoPago: true,
          usuarioReg: true,
          remisiones: {
            where: { flg_anu: false },
            orderBy: { fch_ing: "desc" },
            select: {
              numero: true,
            },
          },
          detalles: {
            include: {
              unidadMedida: true,
            },
            orderBy: { nroitm: "asc" },
          },
        },
      });

      return pedido;
    });

    return Response.json(
      {
        message: "Pedido creado correctamente",
        id_ped: result.id_ped,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear pedido:", error);
    const message = error instanceof Error ? error.message : "";

    if (errorMessages[message]) {
      return Response.json(
        { message: errorMessages[message] },
        { status: 400 },
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

    return Response.json(
      { message: "Ocurrió un error al crear el pedido" },
      { status: 500 },
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

    let where = {};

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

    const pedidos = await prisma.pedidoCabecera.findMany({
      where,
      select: {
        id_ped: true,
        nrodoc: true,
        ano: true,
        mes: true,
        fchdoc: true,
        fch_ing: true,
        fch_ent: true,
        id_clie: true,
        id_ven: true,
        for_pago: true,
        usuario: true,
        id_cot: true,
        cotizacion: true,
        codmon: true,
        tpocmb: true,
        moneda: {
          select: { descrip: true },
        },
        nomaux: true,
        diraux: true,
        rucaux: true,
        ocompra: true,
        flg_incigv: true,
        porigv: true,
        impbto: true,
        impigv: true,
        imptot: true,
        glosa: true,
        factura: true,
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
        guia_remision: true,
        flg_anu: true,
        flg_aprob: true,
        fch_anu: true,
        fch_aprob: true,
        fch_ate: true,
        usuario_anu: true,
        usuario_aprob: true,
        usuario_cie: true,
        estado: true,
        metodoPago: {
          select: { forma_pago: true },
        },
        vendedor: {
          select: { nom_aux: true },
        },
        remisiones: {
          where: { flg_anu: false, estado: { not: "ANULADO" } },
          orderBy: { id_remision: "asc" },
          select: {
            numero: true,
          },
        },
      },
      orderBy: {
        nrodoc: "desc",
      },
    });

    const data = pedidos.map(
      ({ metodoPago, vendedor, moneda, remisiones, facturas, ...pedido }) => {
        const remisionesDesdeFacturas = facturas.flatMap(
          (fac) => fac.remisiones ?? [],
        );

        const numerosGuia = Array.from(
          new Set(
            [...remisiones, ...remisionesDesdeFacturas]
              .map((rem) => rem.numero?.trim())
              .filter((num): num is string => Boolean(num)),
          ),
        );

        const numerosFactura = Array.from(
          new Set(
            facturas
              .map((fac) => fac.num_doc?.trim())
              .filter((num): num is string => Boolean(num)),
          ),
        );

        return {
          ...pedido,
          guia_remision:
            numerosGuia.length > 0
              ? numerosGuia.join(", ")
              : (pedido.guia_remision ?? null),
          formapago: metodoPago.forma_pago,
          vendedor: vendedor.nom_aux,
          moneda: moneda.descrip,
          factura:
            numerosFactura.length > 0
              ? numerosFactura.join(", ")
              : (pedido.factura ?? null),
          impigv: Number(pedido.impigv),
          impbto: Number(pedido.impbto),
          imptot: Number(pedido.imptot),
          tpocmb: Number(pedido.tpocmb),
          porigv: Number(pedido.porigv),
        };
      },
    );

    return Response.json({ data });
  } catch (error) {
    console.error("Error al listar pedidos:", error);

    return Response.json(
      { message: "Error al listar los pedidos" },
      { status: 500 },
    );
  }
}
