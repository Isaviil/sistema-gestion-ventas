import { prisma } from "@/app/lib/prisma";
import { documentosData } from "@/app/services/estaticos";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const vendedor = await prisma.vendor.findUnique({
    where: {
      id_aux: Number(id),
    },
  });

  if (!vendedor) {
    return Response.json(
      { message: "Vendedor no encontrado" },
      { status: 404 },
    );
  }

  return Response.json(vendedor);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const value = body.value;

  const vendedor = await prisma.vendor.findUnique({
    where: {
      id_aux: Number(id),
    },
  });

  if (!vendedor) {
    return Response.json(
      { message: "Vendedor no encontrado" },
      { status: 404 },
    );
  }

  if (!value?.nom_aux?.trim()) {
    return Response.json(
      { message: "El nombre del vendedor es obligatorio" },
      { status: 400 },
    );
  }

  const documento = documentosData.find((item) => item.id === value.tdoc_ide);

  if (value.ndoc_ide?.trim() && documento) {
    if (!documento.pattern.test(value.ndoc_ide.trim())) {
      return Response.json(
        { message: `El número de ${documento.descripcion} no es válido` },
        { status: 400 },
      );
    }
  }

  const existingVendor = await prisma.vendor.findFirst({
    where: {
      ndoc_ide: value.ndoc_ide?.trim() ?? "",
      NOT: {
        id_aux: Number(id),
      },
    },
  });

  if (existingVendor && value.ndoc_ide?.trim()) {
    return Response.json(
      { message: "El número de documento ya está registrado" },
      { status: 400 },
    );
  }

  const updatedVendor = await prisma.vendor.update({
    where: {
      id_aux: Number(id),
    },
    data: {
      nom_aux: value.nom_aux.trim(),
      ape_aux: value.ape_aux?.trim() ?? "",
      ape_mat: value.ape_mat?.trim() ?? "",
      tdoc_ide: value.tdoc_ide?.trim() ?? "",
      ndoc_ide: value.ndoc_ide?.trim() ?? "",
      cel_job: value.cel_job?.trim() ?? "",
      email_job: value.email_job?.trim() ?? "",
    },
  });

  return Response.json({
    message: "Vendedor actualizado correctamente",
    data: updatedVendor,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const vendedor = await prisma.vendor.findUnique({
    where: {
      id_aux: Number(id),
    },
  });

  if (!vendedor) {
    return Response.json(
      { message: "Vendedor no encontrado" },
      { status: 404 },
    );
  }

  await prisma.vendor.delete({
    where: {
      id_aux: Number(id),
    },
  });

  return Response.json({
    message: "Vendedor eliminado correctamente",
  });
}
