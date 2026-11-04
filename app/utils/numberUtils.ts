export const formatPrice = (
  value: number | string,
  decimals: number = 2,
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0.00"; // Manejo de valores no numéricos

  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals, // Fija los decimales (rellena con ceros)
    maximumFractionDigits: decimals, // Evita decimales extra
  });
};
