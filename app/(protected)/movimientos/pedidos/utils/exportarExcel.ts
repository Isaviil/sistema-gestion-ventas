import * as XLSX from "xlsx-js-style";
import { IPedidoListado } from "../types";

const C = {
  white: "FFFFFFFF",
  black: "FF263238",
  border: "FFE2E6E9",
  titleBg: "FF263D36",
  headerBg: "FFF0F2EF",
  danger: "FFDC2626",
};

const style = (
  bold = false,
  bg = C.white,
  hAlign: "left" | "center" | "right" = "left",
  fontSize = 10,
  fontColor = C.black,
): XLSX.CellStyle => ({
  font: {
    name: "Arial",
    sz: fontSize,
    bold,
    color: { rgb: fontColor },
  },
  fill: {
    patternType: "solid",
    fgColor: { rgb: bg },
  },
  alignment: {
    horizontal: hAlign,
    vertical: "center",
  },
  border: {
    top: { style: "thin", color: { rgb: C.border } },
    bottom: { style: "thin", color: { rgb: C.border } },
    left: { style: "thin", color: { rgb: C.border } },
    right: { style: "thin", color: { rgb: C.border } },
  },
});

const fmtDate = (value: string) => {
  if (!value) return "";

  const [year, month, day] = value.substring(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

export const exportPedidosExcel = (data: IPedidoListado[]) => {
  if (!data.length) return;

  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  const headers = [
    "N° PEDIDO",
    "FECHA",
    "FECHA ENTREGA",
    "RUC",
    "CLIENTE",
    "COTIZACIÓN",
    "O/COMPRA",
    "VENDEDOR",
    "FORMA DE PAGO",
    "MONEDA",
    "SUBTOTAL",
    "IGV",
    "TOTAL",
    "ESTADO",
  ];

  const now = new Date();
  const periodo = new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  })
    .format(now)
    .toUpperCase();

  ws["A1"] = {
    v: `PEDIDOS - ${periodo}`,
    t: "s",
    s: style(true, C.titleBg, "center", 16, C.white),
  };

  ws["!merges"] = [XLSX.utils.decode_range("A1:N1")];

  headers.forEach((header, index) => {
    const cell = XLSX.utils.encode_cell({ r: 1, c: index });

    ws[cell] = {
      v: header,
      t: "s",
      s: style(true, C.headerBg, "center", 10),
    };
  });

  data.forEach((item, index) => {
    const row = index + 2;
    const values = [
      item.nrodoc,
      fmtDate(item.fchdoc),
      fmtDate(item.fch_ent),
      item.rucaux,
      item.nomaux,
      item.cotizacion ?? "",
      item.ocompra ?? "",
      item.vendedor,
      item.formapago,
      item.codmon,
      Number(item.impbto),
      Number(item.impigv),
      Number(item.imptot),
      item.estado,
    ];

    values.forEach((value, col) => {
      const cell = XLSX.utils.encode_cell({ r: row, c: col });
      const isMoney = col >= 10 && col <= 12;
      const isEstado = col === 13;
      const isAnulado = isEstado && value === "ANULADO";

      ws[cell] = {
        v: value,
        t: typeof value === "number" ? "n" : "s",
        s: style(
          isEstado,
          C.white,
          isEstado || isMoney ? "right" : "left",
          10,
          isAnulado ? C.danger : C.black,
        ),
        ...(isMoney ? { z: "#,##0.00" } : {}),
      };
    });
  });

  ws["!cols"] = [
    { wch: 17 },
    { wch: 17 },
    { wch: 20 },
    { wch: 19 },
    { wch: 44 },
    { wch: 19 },
    { wch: 20 },
    { wch: 28 },
    { wch: 24 },
    { wch: 16 },
    { wch: 21 },
    { wch: 18 },
    { wch: 19 },
    { wch: 19 },
  ];

  ws["!rows"] = [{ hpt: 38 }, { hpt: 26 }, ...data.map(() => ({ hpt: 22 }))];

  ws["!ref"] = `A1:N${data.length + 2}`;

  XLSX.utils.book_append_sheet(wb, ws, "Pedidos");

  XLSX.writeFile(wb, `Pedidos_${now.getMonth() + 1}_${now.getFullYear()}.xlsx`);
};
