import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: {
      forma_pago: "asc",
    },
  });

  return Response.json(paymentMethods);
}

export async function POST(request: Request) {
  const body = await request.json();

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      forma_pago: body.forma_pago,
      codigo: body.codigo ?? null,
      dias: body.dias,
    },
  });

  return Response.json(
    {
      message: "Forma de pago creada correctamente",
      data: paymentMethod,
    },
    { status: 201 },
  );
}
