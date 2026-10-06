import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const groups = await prisma.productFamily.findMany({
    orderBy: {
      familia: "asc",
    },
  });

  return Response.json({
    data: groups,
  });
}
