import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const tiposCambio = await prisma.exchangeRate.findMany({
    orderBy: {
      fchcmb: "desc",
    },
  });

  return Response.json({
    data: tiposCambio,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const value = body.value;

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

  const tipoCambio = await prisma.exchangeRate.create({
    data: {
      id_tcmb,
      fchcmb: fecha,
      oficmp: value.oficmp,
      ofivta: value.ofivta,
    },
  });

  return Response.json(
    {
      message: "Tipo de cambio creado correctamente",
      data: tipoCambio,
    },
    { status: 201 },
  );
}
