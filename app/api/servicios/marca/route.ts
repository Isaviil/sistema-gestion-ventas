import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: {
      marca: "asc",
    },
  });

  return Response.json({
    data: brands,
  });
}
