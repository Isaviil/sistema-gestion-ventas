import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const tiposDocumento = await prisma.documentType.findMany({
    orderBy: {
      dlar_tdoc: "asc",
    },
  });

  return Response.json({
    data: tiposDocumento,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const value = body.value;

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
    },
  });

  if (existingDocumentType) {
    return Response.json(
      { message: "La abreviatura del documento ya existe" },
      { status: 400 },
    );
  }

  const tipoDocumento = await prisma.documentType.create({
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

  return Response.json(
    {
      message: "Tipo de documento creado correctamente",
      data: tipoDocumento,
    },
    { status: 201 },
  );
}
