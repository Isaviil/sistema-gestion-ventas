import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const transportista = await prisma.chofer.findUnique({
    where: {
      id_chof: Number(id),
    },
  });

  if (!transportista) {
    return Response.json(
      { message: "Transportista no encontrado" },
      { status: 404 },
    );
  }

  return Response.json(transportista);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const transportista = await prisma.chofer.findUnique({
    where: {
      id_chof: Number(id),
    },
  });

  if (!transportista) {
    return Response.json(
      { message: "Transportista no encontrado" },
      { status: 404 },
    );
  }

  const brevete = body.brevete?.trim().toUpperCase();
  const dni = body.dni?.trim();
  const nombre = body.nombre?.trim().toUpperCase();

  if (!brevete) {
    return Response.json(
      { message: "El brevete del transportista es obligatorio" },
      { status: 400 },
    );
  }

  if (!dni) {
    return Response.json(
      { message: "El DNI del transportista es obligatorio" },
      { status: 400 },
    );
  }

  if (!/^\d{8}$/.test(dni)) {
    return Response.json(
      { message: "El DNI debe tener exactamente 8 dígitos" },
      { status: 400 },
    );
  }

  if (!nombre) {
    return Response.json(
      { message: "El nombre del transportista es obligatorio" },
      { status: 400 },
    );
  }

  const existingBrevete = await prisma.chofer.findFirst({
    where: {
      brevete,
      NOT: {
        id_chof: Number(id),
      },
    },
  });

  if (existingBrevete) {
    return Response.json(
      { message: "El brevete del transportista ya existe" },
      { status: 400 },
    );
  }

  const existingDni = await prisma.chofer.findFirst({
    where: {
      dni,
      NOT: {
        id_chof: Number(id),
      },
    },
  });

  if (existingDni) {
    return Response.json(
      { message: "El DNI del transportista ya existe" },
      { status: 400 },
    );
  }

  const updatedTransportista = await prisma.chofer.update({
    where: {
      id_chof: Number(id),
    },
    data: {
      brevete,
      dni,
      nombre,
    },
  });

  return Response.json({
    message: "Transportista actualizado correctamente",
    data: updatedTransportista,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const transportista = await prisma.chofer.findUnique({
    where: {
      id_chof: Number(id),
    },
  });

  if (!transportista) {
    return Response.json(
      { message: "Transportista no encontrado" },
      { status: 404 },
    );
  }

  await prisma.chofer.delete({
    where: {
      id_chof: Number(id),
    },
  });

  return Response.json({
    message: "Transportista eliminado correctamente",
  });
}
