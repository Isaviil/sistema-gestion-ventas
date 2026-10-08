import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const almacen = await prisma.almacen.findUnique({
    where: {
      codalm: Number(id),
    },
  });

  if (!almacen) {
    return Response.json({ message: "Almacén no encontrado" }, { status: 404 });
  }

  return Response.json(almacen);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const almacen = await prisma.almacen.findUnique({
    where: {
      codalm: Number(id),
    },
  });

  if (!almacen) {
    return Response.json({ message: "Almacén no encontrado" }, { status: 404 });
  }

  if (body.codalm !== undefined && Number(body.codalm) !== almacen.codalm) {
    return Response.json(
      { message: "El código del almacén no puede modificarse" },
      { status: 400 },
    );
  }

  const aliasalm = body.aliasalm ?? almacen.aliasalm;
  const desalm = body.desalm ?? almacen.desalm;
  const departam = body.departam ?? almacen.departam;
  const provincia = body.provincia ?? almacen.provincia;
  const distrito = body.distrito ?? almacen.distrito;
  const ubigeo = body.ubigeo ?? almacen.ubigeo;
  const kanexo = body.kanexo ?? almacen.kanexo;
  const usuario = body.usuario ?? almacen.usuario;

  if (!aliasalm?.trim()) {
    return Response.json(
      { message: "El alias del almacén es obligatorio" },
      { status: 400 },
    );
  }

  if (!desalm?.trim()) {
    return Response.json(
      { message: "La descripción del almacén es obligatoria" },
      { status: 400 },
    );
  }

  if (!departam?.trim()) {
    return Response.json(
      { message: "El departamento es obligatorio" },
      { status: 400 },
    );
  }

  if (!provincia?.trim()) {
    return Response.json(
      { message: "La provincia es obligatoria" },
      { status: 400 },
    );
  }

  if (!distrito?.trim()) {
    return Response.json(
      { message: "El distrito es obligatorio" },
      { status: 400 },
    );
  }

  if (!ubigeo?.trim()) {
    return Response.json(
      { message: "El ubigeo es obligatorio" },
      { status: 400 },
    );
  }

  if (kanexo == null || String(kanexo).length > 4) {
    return Response.json(
      { message: "El código de anexo no puede tener más de 4 dígitos" },
      { status: 400 },
    );
  }

  if (!/^\d+$/.test(String(kanexo))) {
    return Response.json(
      { message: "El código de anexo solo puede contener números" },
      { status: 400 },
    );
  }

  if (usuario == null) {
    return Response.json(
      { message: "El usuario es obligatorio" },
      { status: 400 },
    );
  }

  const updatedAlmacen = await prisma.almacen.update({
    where: {
      codalm: Number(id),
    },
    data: {
      aliasalm: aliasalm.trim(),
      desalm: desalm.trim(),
      diralm: body.diralm ?? almacen.diralm,
      departam: departam.trim(),
      provincia: provincia.trim(),
      distrito: distrito.trim(),
      ubigeo: ubigeo.trim(),
      kanexo: String(kanexo).padStart(4, "0"),
      telefalm: body.telefalm ?? almacen.telefalm,
      logoalm: body.logoalm ?? almacen.logoalm,
      flg_stock: body.flg_stock ?? almacen.flg_stock,
      flg_acu: body.flg_acu ?? almacen.flg_acu,
      usuario,
    },
  });

  return Response.json({
    message: "Almacén actualizado correctamente",
    data: updatedAlmacen,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const almacen = await prisma.almacen.findUnique({
    where: {
      codalm: Number(id),
    },
  });

  if (!almacen) {
    return Response.json({ message: "Almacén no encontrado" }, { status: 404 });
  }

  await prisma.almacen.delete({
    where: {
      codalm: Number(id),
    },
  });

  return Response.json(
    { message: "Almacén eliminado correctamente" },
    { status: 200 },
  );
}
