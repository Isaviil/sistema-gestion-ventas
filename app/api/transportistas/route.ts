import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const transportistas = await prisma.chofer.findMany({
    orderBy: {
      id_chof: "asc",
    },
  });

  return Response.json({
    data: transportistas,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

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

  const existingBrevete = await prisma.chofer.findUnique({
    where: {
      brevete,
    },
  });

  if (existingBrevete) {
    return Response.json(
      { message: "El brevete del transportista ya existe" },
      { status: 400 },
    );
  }

  const existingDni = await prisma.chofer.findUnique({
    where: {
      dni,
    },
  });

  if (existingDni) {
    return Response.json(
      { message: "El DNI del transportista ya existe" },
      { status: 400 },
    );
  }

  const transportista = await prisma.chofer.create({
    data: {
      brevete,
      dni,
      nombre,
    },
  });

  return Response.json(
    {
      message: "Transportista creado correctamente",
      data: transportista,
    },
    { status: 201 },
  );
}
