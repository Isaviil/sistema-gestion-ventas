import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const sizes = await prisma.productSize.findMany({
    orderBy: {
      talla: "asc",
    },
  });

  return Response.json({
    data: sizes,
  });
}
