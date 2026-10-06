import { prisma } from "@/app/lib/prisma";
import { documentosData } from "@/app/services/estaticos";

export async function GET() {
  const vendedores = await prisma.vendor.findMany({
    orderBy: {
      cod_ven: "asc",
    },
  });

  const data = vendedores.map((vendedor) => ({
    ...vendedor,
    des_aux: [vendedor.nom_aux, vendedor.ape_aux, vendedor.ape_mat]
      .filter(Boolean)
      .join(" "),
  }));

  return Response.json({
    data,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const value = body.value;

  if (!value?.nom_aux?.trim()) {
    return Response.json(
      { message: "El nombre del vendedor es obligatorio" },
      { status: 400 },
    );
  }

  // Aplicamos las reglas de cada tipo de documento
  const documento = documentosData.find((item) => item.id === value.tdoc_ide);

  if (value.ndoc_ide?.trim() && documento) {
    if (!documento.pattern.test(value.ndoc_ide.trim())) {
      return Response.json(
        { message: `El número de ${documento.descripcion} no es válido` },
        { status: 400 },
      );
    }
  }

  const existingVendor = await prisma.vendor.findFirst({
    where: {
      ndoc_ide: value.ndoc_ide?.trim() ?? "",
    },
  });

  if (existingVendor && value.ndoc_ide?.trim()) {
    return Response.json(
      { message: "El número de documento ya está registrado" },
      { status: 400 },
    );
  }

  const lastVendor = await prisma.vendor.findFirst({
    orderBy: {
      id_aux: "desc",
    },
    select: {
      cod_ven: true,
    },
  });

  const nextCode = lastVendor
    ? String(Number(lastVendor.cod_ven) + 1).padStart(3, "0")
    : "001";

  const vendedor = await prisma.vendor.create({
    data: {
      cod_ven: nextCode,
      nom_aux: value.nom_aux.trim(),
      ape_aux: value.ape_aux?.trim() ?? "",
      ape_mat: value.ape_mat?.trim() ?? "",
      tdoc_ide: value.tdoc_ide?.trim() ?? "",
      ndoc_ide: value.ndoc_ide?.trim() ?? "",
      cel_job: value.cel_job?.trim() ?? "",
      email_job: value.email_job?.trim() ?? "",
      id_area: 0,
    },
  });

  return Response.json(
    {
      message: "Vendedor creado correctamente",
      data: vendedor,
    },
    { status: 201 },
  );
}
