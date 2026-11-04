import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const monedas = await prisma.currency.findMany({
      where: { flg_activo: true },
      orderBy: { codmon: "asc" },
    });

    return NextResponse.json(monedas);
  } catch (error) {
    console.error("Error al listar monedas:", error);

    return NextResponse.json(
      { message: "Error al listar monedas" },
      { status: 500 },
    );
  }
}
