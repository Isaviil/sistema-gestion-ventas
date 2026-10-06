import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const units = await prisma.unitOfMeasure.findMany({
    orderBy: {
      des_umed: "asc",
    },
  });

  return Response.json({
    data: units,
  });
}
