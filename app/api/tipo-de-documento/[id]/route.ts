import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const tipoDocumento = await prisma.documentType.findUnique({
    where: {
      id_tipdoc: Number(id),
    },
  });

  if (!tipoDocumento) {
    return Response.json(
      { message: "Tipo de documento no encontrado" },
      { status: 404 },
    );
  }

  return Response.json(tipoDocumento);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const value = body.value;

  const tipoDocumento = await prisma.documentType.findUnique({
    where: {
      id_tipdoc: Number(id),
    },
  });

  if (!tipoDocumento) {
    return Response.json(
      { message: "Tipo de documento no encontrado" },
      { status: 404 },
    );
  }

  if (!value?.dlar_tdoc?.trim()) {
    return Response.json(
      { message: "El nombre del documento es obligatorio" },
      { status: 400 },
    );
  }

  if (!value?.dcor_tdoc?.trim()) {
    return Response.json(
      { message: "La abreviatura del documento es obligatoria" },
      { status: 400 },
    );
  }

  if (value?.flg_sunat && !value?.codsunat?.trim()) {
    return Response.json(
      { message: "El código SUNAT es obligatorio" },
      { status: 400 },
    );
  }

  if (value?.flg_alm && !value?.alias_alm?.trim()) {
    return Response.json(
      { message: "El alias de almacén es obligatorio" },
      { status: 400 },
    );
  }

  const existingDocumentType = await prisma.documentType.findFirst({
    where: {
      dcor_tdoc: value.dcor_tdoc.trim(),
      NOT: {
        id_tipdoc: Number(id),
      },
    },
  });

  if (existingDocumentType) {
    return Response.json(
      { message: "La abreviatura del documento ya existe" },
      { status: 400 },
    );
  }

  const updatedDocumentType = await prisma.documentType.update({
    where: {
      id_tipdoc: Number(id),
    },
    data: {
      dlar_tdoc: value.dlar_tdoc.trim(),
      dcor_tdoc: value.dcor_tdoc.trim(),
      flg_sunat: value.flg_sunat ?? false,
      codsunat: value.flg_sunat ? value.codsunat?.trim() || null : null,
      flg_alm: value.flg_alm ?? false,
      alias_alm: value.flg_alm ? value.alias_alm?.trim() || null : null,
      flg_vta: value.flg_vta ?? false,
    },
  });

  return Response.json({
    message: "Tipo de documento actualizado correctamente",
    data: updatedDocumentType,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const tipoDocumento = await prisma.documentType.findUnique({
    where: {
      id_tipdoc: Number(id),
    },
  });

  if (!tipoDocumento) {
    return Response.json(
      { message: "Tipo de documento no encontrado" },
      { status: 404 },
    );
  }

  await prisma.documentType.delete({
    where: {
      id_tipdoc: Number(id),
    },
  });

  return Response.json({
    message: "Tipo de documento eliminado correctamente",
  });
}
