import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const colors = await prisma.productColor.findMany({
    orderBy: {
      color: "asc",
    },
  });

  return Response.json({
    data: colors,
  });
}
