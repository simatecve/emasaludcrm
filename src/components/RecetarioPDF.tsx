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

export const generarRecetarioPDF = (data: RecetarioPDFData) => {
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
