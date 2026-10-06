import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: {
      cod_art: "desc",
    },
  });

  return Response.json({
    data: products,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

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

  if (body.pre_art < 0) {
    return Response.json(
      { message: "El precio no puede ser negativo" },
      { status: 400 },
    );
  }

  const product = await prisma.product.create({
    data: {
      cod_art: `TEMP-${crypto.randomUUID()}`,
      des_art: body.des_art,
      des_art2: body.des_art2 ?? null,
      stkact: body.stkact ?? 0,
      peso: body.peso ?? 0,
      pre_art: body.pre_art ?? 0,
      pv2: body.pv2 ?? 0,
      pv3: body.pv3 ?? 0,
      pv4: body.pv4 ?? 0,
      id_umedr: body.id_umedr ?? null,
      id_fam: body.id_fam ?? null,
      id_corte: body.id_corte ?? null,
      id_mar: body.id_mar ?? null,
      id_color: body.id_color ?? null,
      id_talla: body.id_talla ?? null,
      flg_activo: body.flg_activo ?? true,
    },
  });

  const cod_art = String(product.id_art).padStart(6, "0");

  const updatedProduct = await prisma.product.update({
    where: {
      id_art: product.id_art,
    },
    data: {
      cod_art,
    },
  });

  return Response.json(
    {
      message: "Artículo creado correctamente",
      data: updatedProduct,
    },
    { status: 201 },
  );
}
