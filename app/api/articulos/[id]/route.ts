import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id_art: Number(id),
    },
  });

  if (!product) {
    return Response.json(
      { message: "Artículo no encontrado" },
      { status: 404 },
    );
  }

  return Response.json(product);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const product = await prisma.product.findUnique({
    where: {
      id_art: Number(id),
    },
  });

  if (!product) {
    return Response.json(
      { message: "Artículo no encontrado" },
      { status: 404 },
    );
  }

  if (body.cod_art !== undefined && body.cod_art !== product.cod_art) {
    return Response.json(
      { message: "El código del artículo no puede modificarse" },
      { status: 400 },
    );
  }

  if (!body.des_art?.trim()) {
    return Response.json(
      { message: "La descripción del artículo es obligatoria" },
      { status: 400 },
    );
  }

  if (body.stkact < 0) {
    return Response.json(
      { message: "El stock no puede ser negativo" },
      { status: 400 },
    );
  }

  if (body.pre_art <= 0) {
    return Response.json(
      { message: "El precio base debe ser mayor a 0" },
      { status: 400 },
    );
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id_art: Number(id),
    },
    data: {
      des_art: body.des_art,
      des_art2: body.des_art2 ?? null,
      stkact: body.stkact,
      peso: body.peso ?? 0,
      pre_art: body.pre_art,
      pv2: body.pv2 ?? 0,
      pv3: body.pv3 ?? 0,
      pv4: body.pv4 ?? 0,
      id_color: body.id_color,
      id_corte: body.id_corte,
      id_fam: body.id_fam,
      id_mar: body.id_mar,
      id_talla: body.id_talla,
      id_umedr: body.id_umedr ?? null,
    },
  });

  return Response.json({
    message: "Artículo actualizado correctamente",
    product: updatedProduct,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id_art: Number(id),
    },
  });

  if (!product) {
    return Response.json(
      { message: "Artículo no encontrado" },
      { status: 404 },
    );
  }

  await prisma.product.delete({
    where: {
      id_art: Number(id),
    },
  });

  return Response.json(
    { message: "Artículo eliminado correctamente" },
    { status: 200 },
  );
}
