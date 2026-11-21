import * as XLSX from "xlsx-js-style";
import { IFacturaListado } from "../types";

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

const fmtDate = (value: string | null) => {
  if (!value) return "";

  const [year, month, day] = value.substring(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

// ======================================================
// EXPORTAR FACTURAS
// ======================================================

export const exportFacturasExcel = (data: IFacturaListado[]) => {
  if (!data.length) return;

  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  const headers = [
    "N° FACTURA",
    "FECHA",
    "FECHA DE REGISTRO",
    "RUC",
    "CLIENTE",
    "PEDIDO",
    "FACTURA",
    "DIRECCIÓN DE ENTREGA",
    "MONEDA",
    "TIPO DE CAMBIO",
    "IGV (%)",
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
    v: `FACTURAS - ${periodo}`,
    t: "s",
    s: style(true, C.titleBg, "center", 16, C.white),
  };

  ws["!merges"] = [XLSX.utils.decode_range("A1:L1")];

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
      item.num_doc ? `${item.ser_doc}-${item.num_doc}` : item.ser_doc,
      fmtDate(item.fchdoc),
      fmtDate(item.fch_ing),
      item.rucaux ?? "",
      item.nomaux ?? "",
      item.pedido ?? "",
      item.factura ?? "",
      item.diraux ?? "",
      item.codmon ?? "",
      Number(item.tpocmb),
      Number(item.porigv),
      item.estado,
    ];

    values.forEach((value, col) => {
      const cell = XLSX.utils.encode_cell({ r: row, c: col });
      const isEstado = col === 11;
      const isAnulado = isEstado && value === "ANULADO";
      const isNumber = col === 9 || col === 10;

      ws[cell] = {
        v: value,
        t: typeof value === "number" ? "n" : "s",
        s: style(
          isEstado,
          C.white,
          isEstado || isNumber ? "right" : "left",
          10,
          isAnulado ? C.danger : C.black,
        ),
        ...(isNumber ? { z: "#,##0.00" } : {}),
      };
    });
  });

  ws["!cols"] = [
    { wch: 19 },
    { wch: 17 },
    { wch: 21 },
    { wch: 19 },
    { wch: 44 },
    { wch: 19 },
    { wch: 19 },
    { wch: 40 },
    { wch: 16 },
    { wch: 19 },
    { wch: 14 },
    { wch: 19 },
  ];

  ws["!rows"] = [{ hpt: 38 }, { hpt: 26 }, ...data.map(() => ({ hpt: 22 }))];

  ws["!ref"] = `A1:L${data.length + 2}`;

  XLSX.utils.book_append_sheet(wb, ws, "Facturas");

  XLSX.writeFile(
    wb,
    `Facturas_${now.getMonth() + 1}_${now.getFullYear()}.xlsx`,
  );
};
