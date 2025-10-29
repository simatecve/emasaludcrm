import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

const generarRecetarioOSPSIP = (data: RecetarioPDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header - OBRA SOCIAL DEL PERSONAL DE SEGURIDAD COMERCIAL
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OBRA SOCIAL DEL PERSONAL DE SEGURIDAD COMERCIAL', pageWidth / 2, 15, { align: 'center' });
  
  // HISTORIA CLINICA title
  doc.setFontSize(16);
  doc.text('HISTORIA CLINICA', pageWidth / 2, 25, { align: 'center' });
  
  // Second header line
  doc.setFontSize(10);
  doc.text('OBRA SOCIAL DEL PERSONAL DE SEGURIDAD COMERCIAL', pageWidth / 2, 32, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('(DATOS A COMPLETAR POR EL PROFESIONAL EN PATOLOGIAS CRONICAS)', pageWidth / 2, 38, { align: 'center' });
  
  // INDUSTRIAL E INVESTIGACIONES PRIVADAS
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INDUSTRIAL E INVESTIGACIONES PRIVADAS', pageWidth / 2, 44, { align: 'center' });

  // NOMBRE Y APELLIDO BENEFICIARIO section with patient name inline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`NOMBRE Y APELLIDO BENEFICIARIO: ${data.paciente.nombre} ${data.paciente.apellido}`, 20, 52);
  
  // Right side info
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('RNOS: 1-1970-8', pageWidth - 60, 52);
  doc.text('PARANÁ 717 . CABA.', pageWidth - 60, 57);
  doc.text('TUCUMÁN 3685/89 C.A. DE BUENOS AIRES', pageWidth - 60, 62);
  doc.text('Tel.: 0800-333-6777', pageWidth - 60, 67);

  // Main table
  let yPos = 65;
  
  // DIAGNOSTICO section
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSTICO:', 20, yPos);
  
  // First row of info without boxes
  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`FECHA DE EMISION: ${format(new Date(data.fecha), 'dd/MM/yyyy')}`, 20, yPos);
  
  yPos += 5;
  doc.text('N° DE OBRA SOCIAL:', 20, yPos);
  
  yPos += 5;
  doc.text('N° SINDICAL:', 20, yPos);
  
  yPos += 5;
  doc.text('EDAD:', 20, yPos);
  
  yPos += 5;
  doc.text('SINTOMAS Y/O SIGNOS PRINCIPALES:', 20, yPos);
  
  // Medication table
  yPos += 10;
  const colWidths = [40, 20, 30, 35, 20, 25];
  let xPos = 20;
  
  // Table headers
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const headers = ['NOMBRE Y APELLIDO', 'SEXO', 'CANTIDAD RECETADA', 'TIEMPO DE EVOLUCION', 'TAMAÑO', 'NRO LETRAS'];
  
  headers.forEach((header, i) => {
    doc.rect(xPos, yPos, colWidths[i], 8);
    doc.text(header, xPos + 2, yPos + 5);
    xPos += colWidths[i];
  });
  
  // Medication rows
  for (let row = 0; row < 2; row++) {
    yPos += 8;
    xPos = 20;
    
    doc.setFont('helvetica', 'normal');
    doc.rect(xPos, yPos, colWidths[0], 8);
    doc.text(`GENERICO Rp/${row + 1}`, xPos + 2, yPos + 5);
    xPos += colWidths[0];
    
    doc.rect(xPos, yPos, colWidths[1], 8);
    if (row === 1) {
      doc.text('RA', xPos + 2, yPos + 5);
    }
    xPos += colWidths[1];
    
    for (let i = 2; i < colWidths.length; i++) {
      doc.rect(xPos, yPos, colWidths[i], 8);
      xPos += colWidths[i];
    }
  }
  
  // Dosis diaria lines
  yPos += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DOSIS DIARIA GENERICO 1:', 20, yPos);
  
  yPos += 5;
  doc.text('DOSIS DIARIA GENERICO 2:', 20, yPos);

  // COMPLETAR LO QUE CORRESPONDA section
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('COMPLETAR LO QUE CORRESPONDA', 20, yPos);
  
  // Three columns section
  yPos += 5;
  const col1Width = 60;
  const col2Width = 60;
  const col3Width = pageWidth - 40 - col1Width - col2Width;
  
  // Column 1 - DIAGNOSTICO
  doc.rect(20, yPos, col1Width, 30);
  doc.setFontSize(8);
  doc.text('DIAGNOSTICO:', 22, yPos + 5);
  
  // Column 2 - EMBARAZO/PARTO
  doc.rect(20 + col1Width, yPos, col2Width, 15);
  doc.text('EMBARAZO:', 22 + col1Width, yPos + 5);
  doc.text('PARTO CESAREA:', 22 + col1Width, yPos + 10);
  
  doc.rect(20 + col1Width, yPos + 15, col2Width, 15);
  doc.text('R.N:', 22 + col1Width, yPos + 20);
  doc.text('DIAS:         SEMANAS:', 22 + col1Width, yPos + 25);
  
  // Column 3 - Firma profesional
  doc.rect(20 + col1Width + col2Width, yPos, col3Width, 15);
  doc.text('FIRMA Y SELLO DEL PROFESIONAL:', 22 + col1Width + col2Width, yPos + 8);
  
  doc.rect(20 + col1Width + col2Width, yPos + 15, col3Width, 15);
  doc.text('FIRMA Y SELLO DEL PROFESIONAL:', 22 + col1Width + col2Width, yPos + 23);
  
  // NIÑO/A MESES
  yPos += 30;
  doc.rect(20, yPos, col1Width, 8);
  doc.text('NIÑO/A:                 MESES:', 22, yPos + 5);

  // FECHA DE VENTA / FARMACIA section
  yPos += 12;
  doc.rect(20, yPos, col1Width + col2Width, 8);
  doc.text('FECHA DE VENTA:', 22, yPos + 5);
  doc.rect(20 + col1Width + col2Width, yPos, col3Width, 8);
  doc.text('FARMACIA:', 22 + col1Width + col2Width, yPos + 5);
  
  // Discount table
  yPos += 8;
  const halfWidth = (col1Width + col2Width) / 2;
  
  doc.rect(20, yPos, halfWidth, 6);
  doc.text('DESCUENTO OSPSIP', 22, yPos + 4);
  doc.rect(20 + halfWidth, yPos, halfWidth, 6);
  doc.text('DESCUENTO UPSRA', 22 + halfWidth, yPos + 4);
  
  yPos += 6;
  doc.rect(20, yPos, halfWidth, 6);
  doc.text('40% AMBULATORIO', 22, yPos + 4);
  doc.rect(20 + halfWidth, yPos, halfWidth, 6);
  doc.text('60% AMBULATORIO', 22 + halfWidth, yPos + 4);
  
  yPos += 6;
  doc.rect(20, yPos, halfWidth, 6);
  doc.text('70% AMBULATORIO', 22, yPos + 4);
  doc.rect(20 + halfWidth, yPos, halfWidth, 6);
  doc.text('90% AMBULATORIO', 22 + halfWidth, yPos + 4);
  
  yPos += 6;
  doc.rect(20, yPos, col1Width + col2Width, 6);
  doc.text('100% PMI Y ESPECIFICOS', 22, yPos + 4);

  // Bottom section - DNI and contact info
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`DNI DEL TITULAR: ${data.paciente.dni}`, 20, yPos);
  
  yPos += 6;
  doc.text('DN.I DE QUIEN RETIRA:', 20, yPos);
  
  yPos += 6;
  doc.text('DOMICILIO:', 20, yPos);
  
  yPos += 6;
  doc.text('TELEFONO:', 20, yPos);
  
  yPos += 6;
  doc.text('FIRMA Y ACLARACION:', 20, yPos);

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('OBRA SOCIAL DEL PERSONAL DE SEGURIDAD COMERCIAL', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Generate filename and save
  const nombreArchivo = `Recetario_OSPSIP_${data.paciente.apellido}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(nombreArchivo);
};

const generarRecetarioGenerico = (data: RecetarioPDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Título del recetario según tipo
  const tituloRecetario = `Recetario Tipo ${data.tipoRecetario}`;
  
  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(tituloRecetario, pageWidth / 2, 20, { align: 'center' });

  // Fecha de emisión
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const fechaFormateada = format(new Date(data.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es });
  doc.text(`Fecha de emisión: ${fechaFormateada}`, 20, 45);

  // Datos del paciente
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Paciente', 20, 60);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${data.paciente.nombre} ${data.paciente.apellido}`, 20, 70);
  doc.text(`DNI: ${data.paciente.dni}`, 20, 78);
  
  if (data.paciente.numero_afiliado) {
    doc.text(`Nº Afiliado: ${data.paciente.numero_afiliado}`, 20, 86);
  }

  // Obra Social
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Obra Social', 20, 100);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(data.obraSocial.nombre, 20, 110);

  // Área de prescripción (grande)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescripción Médica', 20, 130);
  
  // Recuadro para escribir la prescripción
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(20, 135, pageWidth - 40, 90);

  // Observaciones si hay
  if (data.observaciones) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Observaciones: ${data.observaciones}`, 20, 235);
  }

  // Footer con información adicional según tipo
  const yFooter = pageHeight - 30;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  
  switch(data.tipoRecetario) {
    case 1:
      doc.text('Recetario estándar - Medicamentos de uso general', 20, yFooter);
      break;
    case 2:
      doc.text('Recetario con autorización - Requiere validación de obra social', 20, yFooter);
      break;
    case 3:
      doc.text('Recetario especial - Medicamentos controlados', 20, yFooter);
      break;
  }

  // Línea para firma
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth - 100, pageHeight - 50, pageWidth - 30, pageHeight - 50);
  doc.setFontSize(9);
  doc.text('Firma y sello del médico', pageWidth - 65, pageHeight - 44, { align: 'center' });

  // Generar y descargar el PDF
  const nombreArchivo = `Recetario_${data.paciente.apellido}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(nombreArchivo);
};

export const generarRecetarioPDF = (data: RecetarioPDFData) => {
  // Si la obra social es OSPSIP, usar formato específico
  if (data.obraSocial.nombre.toUpperCase().includes('OSPSIP')) {
    return generarRecetarioOSPSIP(data);
  }
  
  // Para otras obras sociales, usar formato genérico
  return generarRecetarioGenerico(data);
};
