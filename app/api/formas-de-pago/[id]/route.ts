import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: {
      for_pago: Number(id),
    },
  });

  if (!paymentMethod) {
    return Response.json(
      { message: "Forma de pago no encontrada" },
      { status: 404 },
    );
  }

  return Response.json(paymentMethod);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const paymentMethod = await prisma.paymentMethod.update({
    where: {
      for_pago: Number(id),
    },
    data: {
      forma_pago: body.forma_pago,
      codigo: body.codigo ?? null,
      dias: body.dias,
    },
  });

  return Response.json({
    message: "Forma de pago actualizada correctamente",
    paymentMethod,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  await prisma.paymentMethod.delete({
    where: {
      for_pago: Number(id),
    },
  });

  return Response.json(
    { message: "Forma de pago eliminada correctamente" },
    { status: 200 },
  );
}
