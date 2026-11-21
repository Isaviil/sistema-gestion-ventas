import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { formatDateCustom } from "@/app/utils/dateUtils";
import { formatPrice } from "@/app/utils/numberUtils";

export interface DetalleItemFacturaPrint {
  nroitm: number;
  cod_art: string;
  des_art: string;
  can_art: number;
  pu_des: number;
  tot_art: number;
  alias_umed?: string;
  umedida?: string;
}

export interface CabeceraFacturaPrint {
  id_cpc?: number | null;
  id_tipdoc: number;
  ser_doc: string;
  num_doc: string | null;
  fchdoc: string;
  fch_ing: string;
  fch_anu?: string | null;
  flg_anu: boolean;
  nomaux: string;
  rucaux: string;
  diraux?: string | null;
  moneda?: string | null;
  codmon?: string | null;
  formapago?: string | null;
  vendedor?: string | null;
  impsbt: number;
  impigv: number;
  imptot: number;
}

export interface FacturaPrintPayload {
  cabecera: CabeceraFacturaPrint;
  detalle?: DetalleItemFacturaPrint[];
}

const TIPOS_DOC: Record<number, string> = {
  1: "BOLETA",
  2: "FACTURA",
};

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildTicketHtml(
  cabecera: CabeceraFacturaPrint,
  detalles: DetalleItemFacturaPrint[],
  tipoLabel: string,
  numeroComprobante: string,
): string {
  const moneda = cabecera.moneda ?? cabecera.codmon ?? "-";
  const fecha = formatDateCustom(cabecera.fchdoc, "DD/MM/YYYY");
  const hora = formatDateCustom(cabecera.fch_ing, "hh:mm:ss");

  const filasDetalle = detalles
    .map(
      (item) => `
        <div style="display:flex;padding:2px 0;gap:4px;">
          <span style="width:10%;flex-shrink:0;">${escapeHtml(formatPrice(item.can_art, 0))}</span>
          <span style="width:50%;word-break:break-word;">${escapeHtml(item.des_art)}</span>
          <span style="width:20%;text-align:right;">${escapeHtml(formatPrice(item.pu_des, 2))}</span>
          <span style="width:20%;text-align:right;">${escapeHtml(formatPrice(item.tot_art, 2))}</span>
        </div>
      `,
    )
    .join("");

  const anuladoBlock = cabecera.flg_anu
    ? `
      <div style="text-align:center;font-weight:bold;border:1px solid #4b5563;padding:4px;margin:4px 0;">
        ANULADO${
          cabecera.fch_anu
            ? ` - ${escapeHtml(formatDateCustom(cabecera.fch_anu, "DD/MM/YYYY"))}`
            : ""
        }
      </div>
    `
    : "";

  return `
    <div style="width:80mm;padding:3mm 3mm 15mm 3mm;font-size:10px;font-family:sans-serif;box-sizing:border-box;background:#ffffff;color:#000000;">
      <div style="text-align:center;margin-bottom:4px;">
        <h1 style="font-size:12px;font-weight:bold;margin:0;">COMERCIAL ANDINA S.A.C.</h1>
        <p style="margin:0;">Av. Los Próceres 482, Urb. San Luis</p>
        <p style="margin:0;">Lima - Sucursal Principal</p>
        <p style="margin:0;">RUC 20548912301</p>
      </div>

      <div style="text-align:center;border-top:1px dashed #6b7280;border-bottom:1px dashed #6b7280;padding:4px 0;margin-bottom:4px;">
        <p style="font-weight:bold;margin:0;">${escapeHtml(tipoLabel)}</p>
        <p style="font-weight:bold;font-size:11px;margin:0;">${escapeHtml(numeroComprobante)}</p>
      </div>

      <div style="margin-bottom:4px;line-height:1.4;">
        <p style="margin:0;"><b>Cliente:</b> ${escapeHtml(cabecera.nomaux)}</p>
        <p style="margin:0;"><b>DNI/RUC:</b> ${escapeHtml(cabecera.rucaux)}</p>
        <p style="margin:0;"><b>Dirección:</b> ${escapeHtml(cabecera.diraux || "-")}</p>
      </div>

      <div style="margin-bottom:4px;line-height:1.4;">
        <p style="margin:0;">
          <b>Fecha:</b> ${escapeHtml(fecha)} <b>Hora:</b> ${escapeHtml(hora)}
        </p>
        <p style="margin:0;"><b>Moneda:</b> ${escapeHtml(moneda)}</p>
        ${
          cabecera.formapago
            ? `<p style="margin:0;"><b>F. Pago:</b> ${escapeHtml(cabecera.formapago)}</p>`
            : ""
        }
        ${
          cabecera.vendedor
            ? `<p style="margin:0;"><b>Vendedor:</b> ${escapeHtml(cabecera.vendedor)}</p>`
            : ""
        }
      </div>

      <div style="border-top:1px dashed #6b7280;padding-top:4px;margin-bottom:4px;">
        <div style="display:flex;font-weight:bold;border-bottom:1px solid #9ca3af;padding-bottom:4px;margin-bottom:4px;gap:4px;">
          <span style="width:10%;flex-shrink:0;">CANT</span>
          <span style="width:50%;">DESCRIPCIÓN</span>
          <span style="width:20%;text-align:right;">P.U.</span>
          <span style="width:20%;text-align:right;">IMPORTE</span>
        </div>
        ${filasDetalle}
      </div>

      <div style="border-top:1px dashed #6b7280;padding-top:4px;margin-bottom:4px;text-align:right;">
        <p style="margin:0;"><b>GRAVADA S/</b> ${escapeHtml(formatPrice(cabecera.impsbt, 2))}</p>
        <p style="margin:0;"><b>IGV S/</b> ${escapeHtml(formatPrice(cabecera.impigv, 2))}</p>
        <p style="font-size:11px;margin:0;"><b>TOTAL S/</b> ${escapeHtml(formatPrice(cabecera.imptot, 2))}</p>
      </div>

      ${anuladoBlock}
    </div>
  `;
}

export async function descargarFacturaPdf(
  factura: FacturaPrintPayload,
): Promise<void> {
  if (typeof window === "undefined") return;

  const { cabecera, detalle = [] } = factura;
  const tipoLabel = TIPOS_DOC[cabecera.id_tipdoc] ?? "COMPROBANTE";
  const numeroComprobante = `${cabecera.ser_doc}-${cabecera.num_doc}`;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.pointerEvents = "none";
  container.innerHTML = buildTicketHtml(
    cabecera,
    detalle,
    tipoLabel,
    numeroComprobante,
  );

  document.body.appendChild(container);

  try {
    const target = container.firstElementChild as HTMLElement | null;
    if (!target) return;

    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidthMm = 80;
    const pdfHeightMm = (canvas.height * pdfWidthMm) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pdfWidthMm, pdfHeightMm],
    });

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidthMm, pdfHeightMm);
    pdf.save(`${tipoLabel}-${numeroComprobante}.pdf`);
  } finally {
    container.remove();
  }
}
