import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const tipoFiltro = searchParams.get("ft");
    const ano = searchParams.get("ano");
    const mes = searchParams.get("mes");
    const fechaInicio = searchParams.get("start");
    const fechaFin = searchParams.get("end");

    let wherePedido: Record<string, unknown> = {};
    let whereRemision: Record<string, unknown> = {};
    let whereFactura: Record<string, unknown> = {};

    if (tipoFiltro === "year_month") {
      if (!ano || !mes || !/^\d{4}$/.test(ano) || !/^\d{1,2}$/.test(mes)) {
        return Response.json(
          { message: "El año y el mes son obligatorios y deben ser válidos" },
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

      const mesPad = String(numeroMes).padStart(2, "0");

      wherePedido = { ano, mes: mesPad };
      whereRemision = { ano, mes: mesPad };
      whereFactura = { ano, nromes: mesPad };
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
        inicio > fin
      ) {
        return Response.json(
          { message: "El rango de fechas no es válido" },
          { status: 400 },
        );
      }

      fin.setUTCDate(fin.getUTCDate() + 1);
      const rango = { gte: inicio, lt: fin };

      wherePedido = { fchdoc: rango };
      whereRemision = { fchdoc: rango };
      whereFactura = { fchdoc: rango };
    } else {
      return Response.json(
        { message: "El tipo de filtro no es válido" },
        { status: 400 },
      );
    }

    const [pedidos, remisiones, facturas] = await Promise.all([
      prisma.pedidoCabecera.findMany({
        where: wherePedido,
        select: {
          id_ped: true,
          nrodoc: true,
          nomaux: true,
          codmon: true,
          imptot: true,
          estado: true,
          flg_anu: true,
          fchdoc: true,
          vendedor: { select: { nom_aux: true } },
        },
        orderBy: { id_ped: "desc" },
      }),
      prisma.guiaRemisionCabecera.findMany({
        where: whereRemision,
        select: {
          id_remision: true,
          serie: true,
          numero: true,
          estado: true,
          flg_anu: true,
        },
      }),
      prisma.facturacionCabecera.findMany({
        where: whereFactura,
        select: {
          id_cpc: true,
          ser_doc: true,
          num_doc: true,
          codmon: true,
          imptot: true,
          sdodoc: true,
          estado: true,
          flg_anu: true,
        },
      }),
    ]);

    // 1. Facturas
    const facturasActivas = facturas.filter(
      (f) => !f.flg_anu && f.estado !== "ANULADO",
    );
    const facturasAnuladas = facturas.filter(
      (f) => f.flg_anu || f.estado === "ANULADO",
    );
    const totalFacturadoSoles = facturasActivas
      .filter((f) => f.codmon === "1")
      .reduce((acc, f) => acc + Number(f.imptot), 0);
    const totalFacturadoDolares = facturasActivas
      .filter((f) => f.codmon !== "1")
      .reduce((acc, f) => acc + Number(f.imptot), 0);

    // 2. Pedidos
    const pedidosActivos = pedidos.filter(
      (p) => !p.flg_anu && p.estado !== "ANULADO",
    );
    const pedidosAnulados = pedidos.filter(
      (p) => p.flg_anu || p.estado === "ANULADO",
    );
    const pedidosPendientes = pedidosActivos.filter(
      (p) =>
        p.estado === "INGRESADO" ||
        p.estado === "APROBADO" ||
        p.estado === "PARCIAL",
    );

    // 3. Guías de remisión
    const remisionesActivas = remisiones.filter(
      (r) => !r.flg_anu && r.estado !== "ANULADO",
    );
    const remisionesAnuladas = remisiones.filter(
      (r) => r.flg_anu || r.estado === "ANULADO",
    );

    // 4. Mini lista de pedidos pendientes (máx. 5)
    const pendientesRecientes = pedidosPendientes.slice(0, 5).map((p) => ({
      id_ped: p.id_ped,
      nrodoc: p.nrodoc,
      nomaux: p.nomaux,
      vendedor: p.vendedor.nom_aux,
      codmon: p.codmon,
      imptot: Number(p.imptot),
      estado: p.estado,
      fchdoc: p.fchdoc,
    }));

    return Response.json({
      kpis: {
        facturacion: {
          activasCount: facturasActivas.length,
          anuladasCount: facturasAnuladas.length,
          totalSoles: totalFacturadoSoles,
          totalDolares: totalFacturadoDolares,
        },
        pedidos: {
          activosCount: pedidosActivos.length,
          pendientesCount: pedidosPendientes.length,
          anuladasCount: pedidosAnulados.length,
        },
        remisiones: {
          activasCount: remisionesActivas.length,
          anuladasCount: remisionesAnuladas.length,
        },
        totalAnulaciones:
          facturasAnuladas.length +
          pedidosAnulados.length +
          remisionesAnuladas.length,
      },
      pendientesRecientes,
    });
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
    return Response.json(
      { message: "Error al cargar métricas del dashboard" },
      { status: 500 },
    );
  }
}
