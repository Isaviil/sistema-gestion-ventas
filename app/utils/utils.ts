export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const getMonthName = (num: number) => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[num];
};

export const roundToNDecimals = (n: number, dp: number) => {
  const h = +"1".padEnd(dp + 1, "0"); // 10 or 100 or 1000 or etc
  return Math.round(n * h) / h;
};

export const createPrefixObjectKeys =
  (prefix: string) =>
  (source: Record<string, unknown>): Record<string, unknown> => {
    const prefixedSourceTuples: Array<[string, unknown]> = Object.entries(
      source,
    ).map(([key, value]) => [`${prefix}${key}`, value]);

    return Object.fromEntries(prefixedSourceTuples);
  };
