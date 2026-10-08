import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const vehiculos = await prisma.vehicle.findMany({
    orderBy: {
      placa: "asc",
    },
  });

  return Response.json({
    data: vehiculos,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const cabecera = body.cabecera;
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
      },
    });

    if (existingCertificate) {
      return Response.json(
        { message: "El certificado del vehículo ya existe" },
        { status: 400 },
      );
    }
  }

  const vehiculo = await prisma.vehicle.create({
    data: {
      placa,
      marca: cabecera.marca.trim(),
      certificado: certificado || null,
    },
  });

  return Response.json(
    {
      message: "Vehículo creado correctamente",
      data: vehiculo,
    },
    { status: 201 },
  );
}
