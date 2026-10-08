import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id_vehi: Number(id),
    },
  });

  if (!vehicle) {
    return Response.json(
      { message: "Vehículo no encontrado" },
      { status: 404 },
    );
  }

  return Response.json(vehicle);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const cabecera = body.cabecera;

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id_vehi: Number(id),
    },
  });

  if (!vehicle) {
    return Response.json(
      { message: "Vehículo no encontrado" },
      { status: 404 },
    );
  }

  const placa = cabecera?.placa?.trim().toUpperCase();

  if (!placa) {
    return Response.json(
      { message: "La placa del vehículo es obligatoria" },
      { status: 400 },
    );
  }

  if (!/^[A-Z0-9]+$/.test(placa)) {
    return Response.json(
      { message: "La placa solo puede contener letras y números" },
      { status: 400 },
    );
  }

  if (!cabecera?.marca?.trim()) {
    return Response.json(
      { message: "La marca del vehículo es obligatoria" },
      { status: 400 },
    );
  }

  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      placa,
      NOT: {
        id_vehi: Number(id),
      },
    },
  });

  if (existingVehicle) {
    return Response.json(
      { message: "La placa del vehículo ya existe" },
      { status: 400 },
    );
  }

  const certificado = cabecera?.certificado?.trim();

  if (certificado) {
    const existingCertificate = await prisma.vehicle.findFirst({
      where: {
        certificado,
        NOT: {
          id_vehi: Number(id),
        },
      },
    });

    if (existingCertificate) {
      return Response.json(
        { message: "El certificado del vehículo ya existe" },
        { status: 400 },
      );
    }
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: {
      id_vehi: Number(id),
    },
    data: {
      placa,
      marca: cabecera.marca.trim(),
      certificado: certificado || null,
    },
  });

  return Response.json({
    message: "Vehículo actualizado correctamente",
    data: updatedVehicle,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id_vehi: Number(id),
    },
  });

  if (!vehicle) {
    return Response.json(
      { message: "Vehículo no encontrado" },
      { status: 404 },
    );
  }

  await prisma.vehicle.delete({
    where: {
      id_vehi: Number(id),
    },
  });

  return Response.json({
    message: "Vehículo eliminado correctamente",
  });
}
