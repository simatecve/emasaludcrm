import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface RecetarioPDFData {
  paciente: {
    nombre: string;
    apellido: string;
    dni: string;
    numero_afiliado?: string;
  };
  obraSocial: {
    nombre: string;
  };
  tipoRecetario: number;
  fecha: string;
  observaciones?: string;
}

export const generarRecetarioPDF = (data: RecetarioPDFData) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 15; // left margin
  const contentW = pw - m * 2;

  const obraSocialName = data.obraSocial.nombre.toUpperCase();
  let y = 12;

  // ─── HEADER ───
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(obraSocialName, pw / 2, y, { align: 'center' });

  y += 8;
  doc.setFontSize(14);
  doc.text('HISTORIA CLINICA', pw / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(9);
  doc.text(obraSocialName, pw / 2, y, { align: 'center' });

  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('(DATOS A COMPLETAR POR EL PROFESIONAL EN PATOLOGIAS CRONICAS)', pw / 2, y, { align: 'center' });

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('INDUSTRIAL E INVESTIGACIONES PRIVADAS', pw / 2, y, { align: 'center' });

  // Right block - RNOS info
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  const rx = pw - 55;
  doc.text('RNOS: 1-1970-8', rx, 14);
  doc.text('PARANÁ 717 . CABA.', rx, 18);
  doc.text('TUCUMÁN 3685/89 C.A.B.A.', rx, 22);
  doc.text('Tel.: 0800-333-6777', rx, 26);

  // ─── BENEFICIARY DATA ───
  y += 6;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  const drawLabelRow = (label: string, value: string, yp: number, w: number = contentW) => {
    doc.rect(m, yp, w, 7);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label, m + 2, yp + 5);
    doc.setFont('helvetica', 'normal');
    const labelW = doc.getTextWidth(label + ' ');
    doc.text(value, m + 2 + labelW, yp + 5);
  };

  const drawLabelRowAt = (label: string, value: string, yp: number, xStart: number, w: number) => {
    doc.rect(xStart, yp, w, 7);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label, xStart + 2, yp + 5);
    doc.setFont('helvetica', 'normal');
    const labelW = doc.getTextWidth(label + ' ');
    doc.text(value, xStart + 2 + labelW, yp + 5);
  };

  const pacienteNombre = `${data.paciente.apellido}, ${data.paciente.nombre}`;
  drawLabelRow('NOMBRE Y APELLIDO BENEFICIARIO:', pacienteNombre, y);

  y += 7;
  drawLabelRow('DIAGNOSTICO:', '', y);

  y += 7;
  const halfW = contentW / 2;
  drawLabelRowAt('FECHA DE EMISION:', format(new Date(data.fecha), 'dd/MM/yyyy'), y, m, halfW);
  drawLabelRowAt('N° DE OBRA SOCIAL:', data.paciente.numero_afiliado || '', y, m + halfW, halfW);

  y += 7;
  drawLabelRowAt('N° SINDICAL:', '', y, m, halfW);
  drawLabelRowAt('EDAD:', '', y, m + halfW, halfW);

  y += 7;
  drawLabelRow('SINTOMAS Y/O SIGNOS PRINCIPALES:', '', y);

  // ─── MEDICATION TABLE ───
  y += 10;
  const cols = [45, 20, 30, 35, 20, contentW - 150];
  const headers = ['NOMBRE Y APELLIDO', 'SEXO', 'CANTIDAD RECETADA', 'TIEMPO DE EVOLUCION', 'TAMAÑO', 'NRO LETRAS'];

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  let cx = m;
  headers.forEach((h, i) => {
    doc.rect(cx, y, cols[i], 8);
    doc.text(h, cx + 1.5, y + 5);
    cx += cols[i];
  });

  // Rows Rp/1 and Rp/2
  for (let r = 0; r < 2; r++) {
    y += 8;
    cx = m;
    doc.setFont('helvetica', 'normal');
    cols.forEach((w, i) => {
      doc.rect(cx, y, w, 8);
      if (i === 0) {
        doc.text(`GENERICO Rp/${r + 1}`, cx + 1.5, y + 5);
      }
      cx += w;
    });
  }

  // Dosis diaria
  y += 12;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DOSIS DIARIA GENERICO 1: _______________________________________________', m, y);
  y += 6;
  doc.text('DOSIS DIARIA GENERICO 2: _______________________________________________', m, y);

  // ─── COMPLETAR LO QUE CORRESPONDA ───
  y += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPLETAR LO QUE CORRESPONDA', m, y);

  y += 3;
  const c1w = 60;
  const c2w = 55;
  const c3w = contentW - c1w - c2w;
  const blockH = 30;

  // Col 1 - DIAGNOSTICO
  doc.rect(m, y, c1w, blockH);
  doc.setFontSize(7);
  doc.text('DIAGNOSTICO:', m + 2, y + 5);

  // Col 2 - EMBARAZO/PARTO top
  doc.rect(m + c1w, y, c2w, blockH / 2);
  doc.text('EMBARAZO:', m + c1w + 2, y + 5);
  doc.text('PARTO CESAREA:', m + c1w + 2, y + 10);

  // Col 2 - R.N. bottom
  doc.rect(m + c1w, y + blockH / 2, c2w, blockH / 2);
  doc.text('R.N.:', m + c1w + 2, y + blockH / 2 + 5);
  doc.text('DIAS:        SEMANAS:', m + c1w + 2, y + blockH / 2 + 10);

  // Col 3 - FIRMA top
  doc.rect(m + c1w + c2w, y, c3w, blockH / 2);
  doc.setFontSize(6);
  doc.text('FIRMA Y SELLO DEL', m + c1w + c2w + 2, y + 6);
  doc.text('PROFESIONAL:', m + c1w + c2w + 2, y + 10);

  // Col 3 - FIRMA bottom
  doc.rect(m + c1w + c2w, y + blockH / 2, c3w, blockH / 2);
  doc.text('FIRMA Y SELLO DEL', m + c1w + c2w + 2, y + blockH / 2 + 6);
  doc.text('PROFESIONAL:', m + c1w + c2w + 2, y + blockH / 2 + 10);

  // NIÑO/A row
  y += blockH;
  doc.setFontSize(7);
  doc.rect(m, y, c1w + c2w, 7);
  doc.text('NIÑO/A:                    MESES:', m + 2, y + 5);
  doc.rect(m + c1w + c2w, y, c3w, 7);

  // ─── FECHA DE VENTA / FARMACIA ───
  y += 10;
  drawLabelRowAt('FECHA DE VENTA:', '', y, m, c1w + c2w);
  drawLabelRowAt('FARMACIA:', '', y, m + c1w + c2w, c3w);

  // ─── DISCOUNT TABLE ───
  y += 10;
  const dHalf = (c1w + c2w) / 2;
  const dh = 6;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');

  // Headers
  doc.rect(m, y, dHalf, dh);
  doc.text('DESCUENTO OSPSIP', m + 2, y + 4);
  doc.rect(m + dHalf, y, dHalf, dh);
  doc.text('DESCUENTO UPSRA', m + dHalf + 2, y + 4);

  // Row 1
  y += dh;
  doc.setFont('helvetica', 'normal');
  doc.rect(m, y, dHalf, dh);
  doc.text('40% AMBULATORIO', m + 2, y + 4);
  doc.rect(m + dHalf, y, dHalf, dh);
  doc.text('60% AMBULATORIO', m + dHalf + 2, y + 4);

  // Row 2
  y += dh;
  doc.rect(m, y, dHalf, dh);
  doc.text('70% AMBULATORIO', m + 2, y + 4);
  doc.rect(m + dHalf, y, dHalf, dh);
  doc.text('90% AMBULATORIO', m + dHalf + 2, y + 4);

  // Row 3
  y += dh;
  doc.rect(m, y, dHalf * 2, dh);
  doc.text('100% PMI Y ESPECIFICOS', m + 2, y + 4);

  // ─── BOTTOM SECTION ───
  y += 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`DNI DEL TITULAR: ${data.paciente.dni}`, m, y);

  y += 6;
  doc.text('DNI DE QUIEN RETIRA: ___________________________', m, y);

  y += 6;
  doc.text('DOMICILIO: ______________________________________', m, y);

  y += 6;
  doc.text('TELEFONO: _______________________________________', m, y);

  y += 6;
  doc.text('FIRMA Y ACLARACION: ____________________________', m, y);

  // ─── FOOTER ───
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(obraSocialName, pw / 2, ph - 10, { align: 'center' });

  // Save
  const nombreArchivo = `Recetario_${data.paciente.apellido}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(nombreArchivo);
};
