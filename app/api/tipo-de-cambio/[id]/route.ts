import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const tipoCambio = await prisma.exchangeRate.findUnique({
    where: {
      id_tcmb: id,
    },
  });

  if (!tipoCambio) {
    return Response.json(
      { message: "Tipo de cambio no encontrado" },
      { status: 404 },
    );
  }

  return Response.json(tipoCambio);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const value = body.value;

  const tipoCambio = await prisma.exchangeRate.findUnique({
    where: {
      id_tcmb: id,
    },
  });

  if (!tipoCambio) {
    return Response.json(
      { message: "Tipo de cambio no encontrado" },
      { status: 404 },
    );
  }

  if (!value?.fchcmb) {
    return Response.json(
      { message: "La fecha es obligatoria" },
      { status: 400 },
    );
  }

  if (value.oficmp === undefined || value.oficmp === null) {
    return Response.json(
      { message: "El tipo de cambio de compra es obligatorio" },
      { status: 400 },
    );
  }

  if (value.ofivta === undefined || value.ofivta === null) {
    return Response.json(
      { message: "El tipo de cambio de venta es obligatorio" },
      { status: 400 },
    );
  }

  const fecha = new Date(value.fchcmb);

  if (Number.isNaN(fecha.getTime())) {
    return Response.json({ message: "La fecha no es válida" }, { status: 400 });
  }

  if (value.oficmp <= 0 || value.ofivta <= 0) {
    return Response.json(
      { message: "Los tipos de cambio deben ser mayores a 0" },
      { status: 400 },
    );
  }

  const id_tcmb = value.fchcmb.replaceAll("-", "");

  if (id_tcmb !== id) {
    const existingTipoCambio = await prisma.exchangeRate.findUnique({
      where: {
        id_tcmb,
      },
    });

    if (existingTipoCambio) {
      return Response.json(
        { message: "Ya existe un tipo de cambio para esta fecha" },
        { status: 400 },
      );
    }
  }

  const updatedTipoCambio = await prisma.exchangeRate.update({
    where: {
      id_tcmb: id,
    },
    data: {
      id_tcmb,
      fchcmb: fecha,
      oficmp: value.oficmp,
      ofivta: value.ofivta,
    },
  });

  return Response.json({
    message: "Tipo de cambio actualizado correctamente",
    data: updatedTipoCambio,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const tipoCambio = await prisma.exchangeRate.findUnique({
    where: {
      id_tcmb: id,
    },
  });

  if (!tipoCambio) {
    return Response.json(
      { message: "Tipo de cambio no encontrado" },
      { status: 404 },
    );
  }

  await prisma.exchangeRate.delete({
    where: {
      id_tcmb: id,
    },
  });

  return Response.json({
    message: "Tipo de cambio eliminado correctamente",
  });
}
