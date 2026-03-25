import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface RecetarioPDFData {
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
  numeroRecetario?: number;
  // Campos adicionales del formulario
  diagnostico?: string;
  sintomas?: string;
  edad?: string;
  nroSindical?: string;
  generico1?: string;
  generico2?: string;
  dosisGenerico1?: string;
  dosisGenerico2?: string;
}

export const generarRecetarioPDF = (data: RecetarioPDFData) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 15;
  const contentW = pw - m * 2;

  const obraSocialName = (data.obraSocial.nombre || 'OBRA SOCIAL').toUpperCase();
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

  // Numero de recetario correlativo
  if (data.numeroRecetario) {
    y += 6;
    doc.setFontSize(8);
    doc.text(`RECETARIO N°: ${String(data.numeroRecetario).padStart(6, '0')}`, pw / 2, y, { align: 'center' });
  }

  // Right block - RNOS info
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  const rx = pw - 55;
  doc.text('RNOS: 1-1970-8', rx, 14);
  doc.text('San Luis 713 este, esquina', rx, 18);
  doc.text('calle Guemes', rx, 22);
  doc.text('Tel.: 0800-333-6777', rx, 26);

  // ─── HELPER FUNCTIONS ───
  const drawCell = (label: string, value: string, yp: number, xStart: number, w: number, h: number = 7) => {
    doc.rect(xStart, yp, w, h);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label, xStart + 2, yp + 5);
    if (value) {
      doc.setFont('helvetica', 'normal');
      const lw = doc.getTextWidth(label + ' ');
      doc.text(value, xStart + 2 + lw, yp + 5);
    }
  };

  // ─── BENEFICIARY DATA ───
  y += 6;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  const halfW = contentW / 2;
  const pacienteNombre = `${data.paciente.apellido}, ${data.paciente.nombre}`;

  drawCell('NOMBRE Y APELLIDO BENEFICIARIO:', pacienteNombre, y, m, contentW);

  y += 7;
  drawCell('DIAGNOSTICO:', data.diagnostico || '', y, m, contentW);

  y += 7;
  drawCell('FECHA DE EMISION:', format(new Date(data.fecha), 'dd/MM/yyyy'), y, m, halfW);
  drawCell('N° DE OBRA SOCIAL:', data.paciente.numero_afiliado || '', y, m + halfW, halfW);

  y += 7;
  drawCell('N° SINDICAL:', data.nroSindical || '', y, m, halfW);
  drawCell('EDAD:', data.edad || '', y, m + halfW, halfW);

  y += 7;
  drawCell('SINTOMAS Y/O SIGNOS PRINCIPALES:', data.sintomas || '', y, m, contentW);

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

  for (let r = 0; r < 2; r++) {
    y += 8;
    cx = m;
    doc.setFont('helvetica', 'normal');
    const genName = r === 0 ? (data.generico1 || `GENERICO Rp/${r + 1}`) : (data.generico2 || `GENERICO Rp/${r + 1}`);
    cols.forEach((w, i) => {
      doc.rect(cx, y, w, 8);
      if (i === 0) {
        doc.text(genName, cx + 1.5, y + 5);
      }
      cx += w;
    });
  }

  // Dosis diaria
  y += 12;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`DOSIS DIARIA GENERICO 1: ${data.dosisGenerico1 || '_______________________________________________'}`, m, y);
  y += 6;
  doc.text(`DOSIS DIARIA GENERICO 2: ${data.dosisGenerico2 || '_______________________________________________'}`, m, y);

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

  doc.setFontSize(7);

  // Col 1 - DIAGNOSTICO
  doc.rect(m, y, c1w, blockH);
  doc.text('DIAGNOSTICO:', m + 2, y + 5);

  // Col 2 top
  doc.rect(m + c1w, y, c2w, blockH / 2);
  doc.text('EMBARAZO:', m + c1w + 2, y + 5);
  doc.text('PARTO CESAREA:', m + c1w + 2, y + 10);

  // Col 2 bottom
  doc.rect(m + c1w, y + blockH / 2, c2w, blockH / 2);
  doc.text('R.N.:', m + c1w + 2, y + blockH / 2 + 5);
  doc.text('DIAS:        SEMANAS:', m + c1w + 2, y + blockH / 2 + 10);

  // Col 3 top
  doc.rect(m + c1w + c2w, y, c3w, blockH / 2);
  doc.setFontSize(6);
  doc.text('FIRMA Y SELLO DEL', m + c1w + c2w + 2, y + 6);
  doc.text('PROFESIONAL:', m + c1w + c2w + 2, y + 10);

  // Col 3 bottom
  doc.rect(m + c1w + c2w, y + blockH / 2, c3w, blockH / 2);
  doc.text('FIRMA Y SELLO DEL', m + c1w + c2w + 2, y + blockH / 2 + 6);
  doc.text('PROFESIONAL:', m + c1w + c2w + 2, y + blockH / 2 + 10);

  // NIÑO/A
  y += blockH;
  doc.setFontSize(7);
  doc.rect(m, y, c1w + c2w, 7);
  doc.text('NIÑO/A:                    MESES:', m + 2, y + 5);
  doc.rect(m + c1w + c2w, y, c3w, 7);

  // ─── FECHA DE VENTA / FARMACIA ───
  y += 10;
  drawCell('FECHA DE VENTA:', '', y, m, c1w + c2w);
  drawCell('FARMACIA:', '', y, m + c1w + c2w, c3w);

  // ─── DISCOUNT TABLE ───
  y += 10;
  const dHalf = (c1w + c2w) / 2;
  const dh = 6;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');

  doc.rect(m, y, dHalf, dh);
  doc.text('DESCUENTO OSPSIP', m + 2, y + 4);
  doc.rect(m + dHalf, y, dHalf, dh);
  doc.text('DESCUENTO UPSRA', m + dHalf + 2, y + 4);

  y += dh;
  doc.setFont('helvetica', 'normal');
  doc.rect(m, y, dHalf, dh);
  doc.text('40% AMBULATORIO', m + 2, y + 4);
  doc.rect(m + dHalf, y, dHalf, dh);
  doc.text('60% AMBULATORIO', m + dHalf + 2, y + 4);

  y += dh;
  doc.rect(m, y, dHalf, dh);
  doc.text('70% AMBULATORIO', m + 2, y + 4);
  doc.rect(m + dHalf, y, dHalf, dh);
  doc.text('90% AMBULATORIO', m + dHalf + 2, y + 4);

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

  const nombreArchivo = `Recetario_${data.paciente.apellido}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(nombreArchivo);
};
