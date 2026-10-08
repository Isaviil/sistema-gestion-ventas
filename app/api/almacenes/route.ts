import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const almacenes = await prisma.almacen.findMany({
    orderBy: {
      codalm: "asc",
    },
  });

  return Response.json({
    data: almacenes,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.aliasalm?.trim()) {
    return Response.json(
      { message: "El alias del almacén es obligatorio" },
      { status: 400 },
    );
  }

  if (!body.desalm?.trim()) {
    return Response.json(
      { message: "La descripción del almacén es obligatoria" },
      { status: 400 },
    );
  }

  if (!body.departam?.trim()) {
    return Response.json(
      { message: "El departamento es obligatorio" },
      { status: 400 },
    );
  }

  if (!body.provincia?.trim()) {
    return Response.json(
      { message: "La provincia es obligatoria" },
      { status: 400 },
    );
  }

  if (!body.distrito?.trim()) {
    return Response.json(
      { message: "El distrito es obligatorio" },
      { status: 400 },
    );
  }

  if (!body.ubigeo?.trim()) {
    return Response.json(
      { message: "El ubigeo es obligatorio" },
      { status: 400 },
    );
  }

  if (body.kanexo == null || String(body.kanexo).length > 4) {
    return Response.json(
      { message: "El código de anexo no puede tener más de 4 dígitos" },
      { status: 400 },
    );
  }

  if (!/^\d+$/.test(String(body.kanexo))) {
    return Response.json(
      { message: "El código de anexo solo puede contener números" },
      { status: 400 },
    );
  }

  if (body.usuario == null) {
    return Response.json(
      { message: "El usuario es obligatorio" },
      { status: 400 },
    );
  }

  const kanexo = String(body.kanexo).padStart(4, "0");

  const almacen = await prisma.almacen.create({
    data: {
      aliasalm: body.aliasalm.trim(),
      desalm: body.desalm.trim(),
      diralm: body.diralm?.trim() ?? "",
      departam: body.departam.trim(),
      provincia: body.provincia.trim(),
      distrito: body.distrito.trim(),
      ubigeo: body.ubigeo.trim(),
      kanexo,
      telefalm: body.telefalm?.trim() || null,
      logoalm: body.logoalm?.trim() || null,
      flg_stock: body.flg_stock ?? false,
      flg_acu: body.flg_acu ?? false,
      usuario: body.usuario,
    },
  });

  return Response.json(
    {
      message: "Almacén creado correctamente",
      data: almacen,
    },
    { status: 201 },
  );
}
