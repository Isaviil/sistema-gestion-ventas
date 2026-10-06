import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const ubigeos = await prisma.ubigeo.findMany({
    orderBy: {
      codigo: "asc",
    },
  });

  const departamentos = Array.from(
    new Map(
      ubigeos.map((item) => [
        item.codigo.substring(0, 2),
        {
          id_depart: item.codigo.substring(0, 2),
          departamento: item.departamento,
        },
      ]),
    ).values(),
  );

  const provincias = Array.from(
    new Map(
      ubigeos.map((item) => [
        item.codigo.substring(0, 4),
        {
          id_provincia: item.codigo.substring(0, 4),
          id_depart: item.codigo.substring(0, 2),
          provincia: item.provincia,
        },
      ]),
    ).values(),
  );

  const distritos = ubigeos.map((item) => ({
    id_provincia: item.codigo.substring(0, 4),
    id_distrito: item.codigo,
    distrito: item.distrito,
  }));

  return Response.json({
    data: {
      departamentos,
      provincias,
      distritos,
    },
  });
}
