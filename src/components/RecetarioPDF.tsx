import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';

export interface RecetarioPDFData {
  paciente: {
    nombre: string;
    apellido: string;
    dni: string;
    numero_afiliado?: string;
    fecha_nacimiento?: string;
  };
  obraSocial: {
    nombre: string;
  };
  tipoRecetario: number;
  fecha: string;
  observaciones?: string;
  numeroRecetario?: number;
  diagnostico?: string;
  sintomas?: string;
  edad?: string;
  nroSindical?: string;
  generico1?: string;
  generico2?: string;
  dosisGenerico1?: string;
  dosisGenerico2?: string;
}

const calcularEdad = (fechaNac?: string): string => {
  if (!fechaNac) return '';
  try {
    const d = parseLocalDate(fechaNac);
    const diff = Date.now() - d.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age >= 0 && age < 130 ? String(age) : '';
  } catch {
    return '';
  }
};

const drawBlock = (doc: jsPDF, originY: number, data: RecetarioPDFData) => {
  const pw = doc.internal.pageSize.getWidth();
  const m = 8;
  const W = pw - m * 2;
  const x0 = m;

  // Outer block border
  const blockH = 130;
  doc.setLineWidth(0.4);
  doc.setDrawColor(0);
  doc.rect(x0, originY, W, blockH);

  // ─── HEADER ───
  let y = originY + 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  const titulo = 'EMA SALUD';
  doc.text(titulo, pw / 2, y, { align: 'center' });
  // Underline
  const tw = doc.getTextWidth(titulo);
  doc.setLineWidth(0.3);
  doc.line(pw / 2 - tw / 2, y + 1, pw / 2 + tw / 2, y + 1);

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  y += 5;
  doc.text('San Luis 713 (Este) - Capital', pw / 2, y, { align: 'center' });
  y += 4;
  doc.text('CP 5400 - San Juan', pw / 2, y, { align: 'center' });

  // Title bar "ORDEN DE FARMACIA"
  y = originY + 24;
  doc.setFont('times', 'normal');
  doc.setFontSize(15);
  doc.text('ORDEN DE FARMACIA', pw / 2, y + 6, { align: 'center' });

  // ─── TABLE ───
  // Define columns (widths in mm)
  const tableTop = originY + 30;
  const tableH = blockH - 32;

  // Main split: left content (apellido/rps/diag) | middle (cant/nº/letras) | firma farmacia | troqueles
  const colA = 78;          // left column (apellido, rp1, rp2, diag, firma conf)
  const colB = 22;          // cantidad / Nº / Letras
  const colC = 38;          // firma y sello farmacia
  const colT = W - colA - colB - colC; // troqueles area

  const xA = x0;
  const xB = x0 + colA;
  const xC = xB + colB;
  const xT = xC + colC;

  // Row heights
  const rH1 = 12;  // header row: Fecha emision / Carnet / Edad | Fecha disp / Farmacia / Folio / troquel
  const rApe = 14; // apellido y nombre + cantidad
  const rRp = 18;  // Rp1
  const rRp2 = 18; // Rp2
  const rDiag = 16;
  const rFirma = tableH - rH1 - rApe - rRp - rRp2 - rDiag;

  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'normal');

  // === Row 1: header info ===
  let ry = tableTop;
  // Left part split into: Fecha Emisión (28) | Nº Carnet (32) | Edad (18) = 78
  const wFE = 28, wCa = 32, wEd = 18;
  doc.rect(xA, ry, wFE, rH1);
  doc.rect(xA + wFE, ry, wCa, rH1);
  doc.rect(xA + wFE + wCa, ry, wEd, rH1);
  // Middle (colB+colC area split): Fecha Dispensacion (colB+? ) | Farmacia (?) | Folio (?) | troquel
  // We'll merge B+C+T into 4 cells: FechaDisp, Farmacia, Folio, troquel
  const headRight = colB + colC + colT;
  const wFD = 28, wFar = 24, wFol = 18;
  const wTr1 = headRight - wFD - wFar - wFol;
  doc.rect(xB, ry, wFD, rH1);
  doc.rect(xB + wFD, ry, wFar, rH1);
  doc.rect(xB + wFD + wFar, ry, wFol, rH1);
  doc.rect(xB + wFD + wFar + wFol, ry, wTr1, rH1);

  doc.setFontSize(7);
  doc.text('Fecha de Emisión', xA + 1.5, ry + 3);
  doc.text('Nº de Carnet de Beneficiario', xA + wFE + 1.5, ry + 3);
  doc.text('Edad', xA + wFE + wCa + 1.5, ry + 3);
  doc.text('Fecha Dispensación', xB + 1.5, ry + 3);
  doc.text('Farmacia', xB + wFD + 1.5, ry + 3);
  doc.text('Folio', xB + wFD + wFar + 1.5, ry + 3);
  doc.text('Troquel', xB + wFD + wFar + wFol + 1.5, ry + 3);

  // Fill values
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(format(parseLocalDate(data.fecha), 'dd/MM/yyyy'), xA + 1.5, ry + 9);
  doc.text(data.paciente.numero_afiliado || '', xA + wFE + 1.5, ry + 9);
  const edad = data.edad || calcularEdad(data.paciente.fecha_nacimiento);
  doc.text(edad, xA + wFE + wCa + 1.5, ry + 9);
  doc.setFont('helvetica', 'normal');

  // === Row 2: Apellido y Nombre | Cantidad | Firma y Sello Farmacia (rowspan) | troquel ===
  ry += rH1;
  // Firma farmacia spans rApe + rRp + rRp2 + rDiag
  const firmaFarmH = rApe + rRp + rRp2 + rDiag;
  doc.rect(xC, ry, colC, firmaFarmH);

  // Apellido y nombre row
  doc.rect(xA, ry, colA, rApe);
  doc.rect(xB, ry, colB, rApe);
  // Troquel column for this row
  doc.rect(xT, ry, colT, rApe);

  doc.setFontSize(7);
  doc.text('Apellido y Nombre', xA + 1.5, ry + 3);
  doc.text('Cantidad', xB + 1.5, ry + 3);
  doc.text('Troquel', xT + 1.5, ry + 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const fullName = `${data.paciente.apellido || ''}, ${data.paciente.nombre || ''}`.toUpperCase();
  doc.text(fullName, xA + 1.5, ry + 10);
  doc.setFont('helvetica', 'normal');

  // === Row 3: Rp1 | Nº | Letras (split colB into 2) | troquel ===
  ry += rApe;
  doc.rect(xA, ry, colA, rRp);
  // Split middle into Nº and Letras horizontally
  const wNum = 8;
  doc.rect(xB, ry, wNum, rRp);
  doc.rect(xB + wNum, ry, colB - wNum, rRp);
  doc.rect(xT, ry, colT, rRp);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Rp 1', xA + 1.5, ry + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Nº', xB + 1.5, ry + 3);
  doc.text('Letras', xB + wNum + 1.5, ry + 3);
  doc.text('Troquel', xT + 1.5, ry + 3);

  // Rp1 contents (medicamento + dosis)
  if (data.generico1) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(data.generico1, xA + 4, ry + 9);
    if (data.dosisGenerico1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Dosis: ${data.dosisGenerico1}`, xA + 4, ry + 14);
    }
  }

  // === Row 4: Rp2 ===
  ry += rRp;
  doc.rect(xA, ry, colA, rRp2);
  doc.rect(xB, ry, wNum, rRp2);
  doc.rect(xB + wNum, ry, colB - wNum, rRp2);
  doc.rect(xT, ry, colT, rRp2);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Rp 2', xA + 1.5, ry + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Troquel', xT + 1.5, ry + 3);

  if (data.generico2) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(data.generico2, xA + 4, ry + 9);
    if (data.dosisGenerico2) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Dosis: ${data.dosisGenerico2}`, xA + 4, ry + 14);
    }
  }

  // === Row 5: Diagnostico (across A+B) | troquel ===
  ry += rRp2;
  doc.rect(xA, ry, colA + colB, rDiag);
  doc.rect(xT, ry, colT, rDiag);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Diagnóstico', xA + 1.5, ry + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Troquel', xT + 1.5, ry + 3);

  if (data.diagnostico) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const diagLines = doc.splitTextToSize(data.diagnostico, colA + colB - 4);
    doc.text(diagLines.slice(0, 2), xA + 2, ry + 10);
  }

  // Firma y Sello Farmacia label (centered in its merged cell)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Firma y Sello Farmacia', xC + colC / 2, originY + 30 + rH1 + firmaFarmH - 3, { align: 'center' });

  // === Row 6: firma Conformidad | Matricula | Firma Profesional | troqueles (split) ===
  ry += rDiag;
  // Left split: Firma Conformidad (40) | Matricula (38) = colA
  const wFC = 40;
  const wMat = colA - wFC;
  doc.rect(xA, ry, wFC, rFirma);
  doc.rect(xA + wFC, ry, wMat, rFirma);
  // Firma Profesional spans colB + colC
  doc.rect(xB, ry, colB + colC, rFirma);
  // Troquel area split into 4 cells (2 rows x 2 cols? reference shows 4 troquels in row + 4 in row)
  // We'll do 4 vertical cells side by side
  const troqW = colT / 4;
  for (let i = 0; i < 4; i++) {
    doc.rect(xT + i * troqW, ry, troqW, rFirma / 2);
    doc.rect(xT + i * troqW, ry + rFirma / 2, troqW, rFirma / 2);
  }

  doc.setFontSize(7);
  doc.text('Firma de Conformidad del', xA + 1.5, ry + rFirma - 6);
  doc.text('Beneficiario', xA + 1.5, ry + rFirma - 3);
  doc.text('Matrícula', xA + wFC + wMat / 2, ry + 3, { align: 'center' });
  doc.text('Firma y Sello Profesional', xB + (colB + colC) / 2, ry + rFirma - 3, { align: 'center' });

  doc.setFontSize(6);
  for (let i = 0; i < 4; i++) {
    doc.text('Troquel', xT + i * troqW + troqW / 2, ry + 3, { align: 'center' });
    doc.text('Troquel', xT + i * troqW + troqW / 2, ry + rFirma / 2 + 3, { align: 'center' });
  }

  // Numero de recetario (top-right of block, small)
  if (data.numeroRecetario) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Nº ${String(data.numeroRecetario).padStart(6, '0')}`,
      x0 + W - 3,
      originY + 4,
      { align: 'right' }
    );
  }
};

export const generarRecetarioPDF = (data: RecetarioPDFData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const ph = doc.internal.pageSize.getHeight();

  // Two identical blocks (original + duplicado)
  const topMargin = 8;
  const blockH = 130;
  const gap = ph - topMargin * 2 - blockH * 2; // remaining space split

  drawBlock(doc, topMargin, data);
  drawBlock(doc, topMargin + blockH + Math.max(gap, 4), data);

  const nombreArchivo = `Recetario_${data.paciente.apellido || 'paciente'}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(nombreArchivo);
};
