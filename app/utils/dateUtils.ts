const MONTHS_ES = [
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

export const formatDateCustom = (
  isoDateStr: string,
  format: string = "YYYY-MM-DD hh:mm:ss",
): string => {
  if (!isoDateStr) return "";

  // Extraer partes de la fecha
  const [datePart, timePart] = isoDateStr.split("T");
  if (!datePart) return "";

  const [year, month, day] = datePart.split("-");
  const [hour = "00", minute = "00", secondRaw = "00"] = (timePart || "").split(
    ":",
  );
  const second = secondRaw?.split(".")[0] || "00";

  // Convertir a números para manejar meses y días
  const monthNum = parseInt(month, 10) - 1;
  //const dayNum = parseInt(day, 10);

  // Reemplazos básicos
  const replacements: Record<string, string> = {
    YYYY: year,
    MM: month,
    DD: day,
    hh: hour,
    mm: minute,
    ss: second,
    MMMM: MONTHS_ES[monthNum] || "",
    MMM: MONTHS_ES[monthNum]?.substring(0, 3) || "",
  };

  // Procesar el formato con texto literal entre corchetes
  const result = format;
  let currentPos = 0;
  let output = "";

  while (currentPos < result.length) {
    const openBracket = result.indexOf("[", currentPos);

    if (openBracket === -1) {
      // No hay más corchetes, procesar el resto normalmente
      output += result.substring(currentPos);
      break;
    }

    // Agregar texto antes del corchete con reemplazos
    output += result
      .substring(currentPos, openBracket)
      .replace(
        /YYYY|MMMM|MMM|MM|DD|hh|mm|ss/g,
        (match) => replacements[match] || match,
      );

    const closeBracket = result.indexOf("]", openBracket);
    if (closeBracket === -1) {
      // Corchete no cerrado, terminar
      output += result.substring(openBracket);
      break;
    }

    // Agregar texto literal entre corchetes (sin procesar)
    output += result.substring(openBracket + 1, closeBracket);
    currentPos = closeBracket + 1;
  }

  // Aplicar los reemplazos finales al texto fuera de corchetes
  output = output.replace(
    /YYYY|MMMM|MMM|MM|DD|hh|mm|ss/g,
    (match) => replacements[match] || match,
  );

  return output;
};

// Ejemplos de uso:
/*
formatDateCustom("2023-10-23T00:00:00Z", "DD [de] MMMM [del] YYYY");
// Devuelve: "23 de Octubre del 2023"

formatDateCustom("2023-10-23T00:00:00Z", "Hoy es [el día] DD [del mes de] MMMM");
// Devuelve: "Hoy es el día 23 del mes de Octubre"

formatDateCustom("2023-10-23T15:30:45Z", "YYYY-MM-DD hh:mm:ss");
// Devuelve: "2023-10-23 15:30:45"

formatDateCustom("2023-10-23T00:00:00Z", "MMM DD, YYYY");
// Devuelve: "Oct 23, 2023"
*/

export const formatDateString = (
  isoDateStr: string,
  format: string = "YYYY-MM-DD hh:mm:ss",
): string => {
  if (!isoDateStr) return "";

  const [datePart, timePart] = isoDateStr.split("T");
  if (!datePart) return "";

  const [year, month, day] = datePart.split("-");
  const [hour = "00", minute = "00", secondRaw = "00"] = (timePart || "").split(
    ":",
  );
  const second = secondRaw?.split(".")[0] || "00";

  const replacements: Record<string, string> = {
    YYYY: year,
    MM: month,
    DD: day,
    hh: hour,
    mm: minute,
    ss: second,
  };

  return Object.entries(replacements).reduce(
    (acc, [token, value]) => acc.replace(token, value),
    format,
  );
};
/* formatDateString("2025-05-22T20:46:43.977Z", "DD-MM-YYYY"); // "22/05/2025"
formatDateString("2025-05-22T20:46:43.977Z", "hh:mm:ss");    // "20:46:43"
formatDateString("2025-05-22T20:46:43.977Z", "YYYY-MM");     // "2025/05"
formatDateString("2025-05-22T20:46:43.977Z", "YYYY");        // "2025" */

type DateType = "now" | "start" | "end";

export const getLimaDate = (
  format: string = "YYYY-MM-DD hh:mm:ss",
  type: DateType = "now",
  asNativeDate: boolean = false,
): string | Date => {
  const now = new Date();
  const limaOffsetMs = -5 * 60 * 60 * 1000;
  const limaDate = new Date(
    now.getTime() + now.getTimezoneOffset() * 60000 + limaOffsetMs,
  );

  let dateToFormat = new Date(limaDate);

  if (type === "start") {
    dateToFormat.setDate(1);
    dateToFormat.setHours(0, 0, 0, 0);
  }

  if (type === "end") {
    dateToFormat = new Date(
      dateToFormat.getFullYear(),
      dateToFormat.getMonth() + 1,
      0,
    );
    dateToFormat.setHours(23, 59, 59, 999);
  }

  if (asNativeDate) return dateToFormat;

  const YYYY = dateToFormat.getFullYear().toString();
  const MM = String(dateToFormat.getMonth() + 1).padStart(2, "0");
  const DD = String(dateToFormat.getDate()).padStart(2, "0");
  const hh = String(dateToFormat.getHours()).padStart(2, "0");
  const mm = String(dateToFormat.getMinutes()).padStart(2, "0");
  const ss = String(dateToFormat.getSeconds()).padStart(2, "0");

  return format
    .replace(/YYYY/g, YYYY)
    .replace(/MM/g, MM)
    .replace(/DD/g, DD)
    .replace(/hh/g, hh)
    .replace(/mm/g, mm)
    .replace(/ss/g, ss);
};

/* getLimaDate(); // "2025-05-27 09:53:00"
getLimaDate('DD/MM/YYYY'); // "27/05/2025"
getLimaDate('YYYY-MM-DD', 'start'); // "2025-05-01"
getLimaDate('YYYY-MM-DD', 'end'); // "2025-05-31"
getLimaDate(undefined, 'now', true); // Devuelve objeto Date con hora de Lima */
