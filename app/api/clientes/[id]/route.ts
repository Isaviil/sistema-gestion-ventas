import { prisma } from "@/app/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: {
      id_aux: Number(id),
    },
  });

  if (!customer) {
    return Response.json({ message: "Cliente no encontrado" }, { status: 404 });
  }

  return Response.json(customer);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const customer = await prisma.customer.findUnique({
    where: {
      id_aux: Number(id),
    },
  });

  if (!customer) {
    return Response.json({ message: "Cliente no encontrado" }, { status: 404 });
  }

  if (body.tdoc_ide === "1" && body.ruc_aux.trim().length !== 8) {
    return Response.json(
      { message: "El DNI debe tener 8 dígitos" },
      { status: 400 },
    );
  }

  if (body.tdoc_ide === "6" && body.ruc_aux.trim().length !== 11) {
    return Response.json(
      { message: "El RUC debe tener 11 dígitos" },
      { status: 400 },
    );
  }

  if (!body.des_aux?.trim()) {
    return Response.json(
      { message: "El nombre o razón social del cliente es obligatorio" },
      { status: 400 },
    );
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.&'-]+$/.test(body.des_aux.trim())) {
    return Response.json(
      {
        message:
          "El nombre o razón social solo puede contener letras, espacios y los caracteres . & ' -",
      },
      { status: 400 },
    );
  }

  if (!body.ruc_aux?.trim()) {
    return Response.json(
      { message: "El número de documento del cliente es obligatorio" },
      { status: 400 },
    );
  }

  if (body.tipo_pers === null || body.tipo_pers === undefined) {
    return Response.json(
      { message: "El tipo de persona es obligatorio" },
      { status: 400 },
    );
  }

  if (!body.tdoc_ide?.trim()) {
    return Response.json(
      { message: "El tipo de documento es obligatorio" },
      { status: 400 },
    );
  }

  if (!body.dir_legal?.trim()) {
    return Response.json(
      { message: "La dirección legal es obligatoria" },
      { status: 400 },
    );
  }

  if (!body.ubigeo?.trim()) {
    return Response.json(
      { message: "El ubigeo es obligatorio" },
      { status: 400 },
    );
  }

  if (!body.departamento?.trim()) {
    return Response.json(
      { message: "El departamento es obligatorio" },
      { status: 400 },
    );
  }

  if (!body.provincia?.trim()) {
    return Response.json(
      { message: "La provincia es obligatoria" },
      { status: 400 },
    );
  }

  if (!body.distrito?.trim()) {
    return Response.json(
      { message: "El distrito es obligatorio" },
      { status: 400 },
    );
  }

  if (body.id_ven === null || body.id_ven === undefined) {
    return Response.json(
      { message: "El vendedor es obligatorio" },
      { status: 400 },
    );
  }

  if (body.id_tpoclie === null || body.id_tpoclie === undefined) {
    return Response.json(
      { message: "El tipo de cliente es obligatorio" },
      { status: 400 },
    );
  }

  if (
    body.ruc_aux.trim() !== customer.ruc_aux &&
    (await prisma.customer.findUnique({
      where: {
        ruc_aux: body.ruc_aux.trim(),
      },
    }))
  ) {
    return Response.json(
      {
        message: "Ya existe un cliente registrado con este número de documento",
      },
      { status: 409 },
    );
  }

  const updatedCustomer = await prisma.customer.update({
    where: {
      id_aux: Number(id),
    },
    data: {
      des_aux: body.des_aux.trim(),
      tipo_pers: body.tipo_pers,
      tdoc_ide: body.tdoc_ide.trim(),
      ruc_aux: body.ruc_aux.trim(),
      dir_legal: body.dir_legal.trim(),
      referencia: body.referencia?.trim() || null,
      telefono: body.telefono?.trim() || null,
      email: body.email?.trim() || null,
      ubigeo: body.ubigeo.trim(),
      departamento: body.departamento.trim(),
      provincia: body.provincia.trim(),
      distrito: body.distrito.trim(),
      id_ven: body.id_ven,
      for_pago: body.for_pago ?? null,
      id_tpoclie: body.id_tpoclie,
    },
  });

  return Response.json({
    message: "Cliente actualizado correctamente",
    customer: updatedCustomer,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: {
      id_aux: Number(id),
    },
  });

  if (!customer) {
    return Response.json({ message: "Cliente no encontrado" }, { status: 404 });
  }

  await prisma.customer.delete({
    where: {
      id_aux: Number(id),
    },
  });

  return Response.json(
    { message: "Cliente eliminado correctamente" },
    { status: 200 },
  );
}
