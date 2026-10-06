import { NextResponse } from "next/server";

const API_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImlzYXZpbC45NHNAZ21haWwuY29tIiwianRpIjoiZmUyMmFhNGJjNmU4ZDQzOSJ9.AkKpWBkLpRfj-KXVsLQVdKu3Qm0w1SCei9wjsjoxH1s";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const numero = searchParams.get("numero");

  if (!tipo || !numero) {
    return NextResponse.json({ message: "Faltan parámetros" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://dniruc.apisperu.com/api/v1/${tipo}/${numero}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 },
    );
  }
}
