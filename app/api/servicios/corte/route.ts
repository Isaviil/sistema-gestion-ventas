import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const cuts = await prisma.productCut.findMany({
    orderBy: {
      corte: "asc",
    },
  });

  return Response.json({
    data: cuts,
  });
}
