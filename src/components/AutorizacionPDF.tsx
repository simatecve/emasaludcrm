
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { Autorizacion } from '@/hooks/useAutorizaciones';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AutorizacionPDFProps {
  autorizacion: Autorizacion;
}

const AutorizacionPDF = ({ autorizacion }: AutorizacionPDFProps) => {
  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AUTORIZACIÓN DE SERVICIOS MÉDICOS', pageWidth / 2, 20, { align: 'center' });
    
    // Subheader
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('ORDEN DE CONSULTA / PRÁCTICA / INTERNACIÓN', pageWidth / 2, 30, { align: 'center' });
    
    // Box for authorization number
    pdf.rect(20, 40, pageWidth - 40, 15);
    pdf.setFontSize(10);
    pdf.text(`N° AUTORIZACIÓN: ${autorizacion.numero_autorizacion || 'PENDIENTE'}`, 25, 50);
    
    // Patient data section
    let yPos = 70;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATOS DEL BENEFICIARIO:', 20, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    // Patient info
    const paciente = autorizacion.pacientes;
    if (paciente) {
      pdf.text(`Apellido y Nombre: ${paciente.apellido}, ${paciente.nombre}`, 20, yPos);
      yPos += 8;
      pdf.text(`DNI: ${paciente.dni}`, 20, yPos);
      yPos += 8;
      if (autorizacion.numero_credencial) {
        pdf.text(`N° Credencial: ${autorizacion.numero_credencial}`, 20, yPos);
        yPos += 8;
      }
      if (autorizacion.parentesco_beneficiario) {
        pdf.text(`Parentesco: ${autorizacion.parentesco_beneficiario}`, 20, yPos);
        yPos += 8;
      }
    }
    
    // Obra Social
    yPos += 5;
    if (autorizacion.obras_sociales) {
      pdf.text(`Obra Social: ${autorizacion.obras_sociales.nombre}`, 20, yPos);
      yPos += 8;
    }
    
    // Service details
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRESTACIÓN AUTORIZADA:', 20, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    if (autorizacion.prestacion_codigo) {
      pdf.text(`Código: ${autorizacion.prestacion_codigo}`, 20, yPos);
      yPos += 8;
    }
    if (autorizacion.prestacion_descripcion) {
      const lines = pdf.splitTextToSize(autorizacion.prestacion_descripcion, pageWidth - 40);
      pdf.text(lines, 20, yPos);
      yPos += lines.length * 6;
    }
    if (autorizacion.prestacion_cantidad) {
      pdf.text(`Cantidad: ${autorizacion.prestacion_cantidad}`, 20, yPos);
      yPos += 8;
    }
    
    // Provider
    if (autorizacion.prestador) {
      yPos += 5;
      pdf.text(`Prestador: ${autorizacion.prestador}`, 20, yPos);
      yPos += 8;
    }
    
    // Doctor info
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('MÉDICO SOLICITANTE:', 20, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    if (autorizacion.medicos) {
      pdf.text(`Dr/a: ${autorizacion.medicos.nombre} ${autorizacion.medicos.apellido}`, 20, yPos);
      yPos += 8;
      pdf.text(`Matrícula: ${autorizacion.medicos.matricula}`, 20, yPos);
      yPos += 8;
    }
    if (autorizacion.profesional_solicitante) {
      pdf.text(`Especialidad: ${autorizacion.profesional_solicitante}`, 20, yPos);
      yPos += 8;
    }
    
    // Authorization details
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('DETALLES DE LA AUTORIZACIÓN:', 20, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Tipo: ${autorizacion.tipo_autorizacion}`, 20, yPos);
    yPos += 8;
    pdf.text(`Estado: ${autorizacion.estado.toUpperCase()}`, 20, yPos);
    yPos += 8;
    
    if (autorizacion.fecha_solicitud) {
      pdf.text(`Fecha Solicitud: ${format(new Date(autorizacion.fecha_solicitud), 'dd/MM/yyyy', { locale: es })}`, 20, yPos);
      yPos += 8;
    }
    
    if (autorizacion.fecha_vencimiento) {
      pdf.text(`Fecha Vencimiento: ${format(new Date(autorizacion.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}`, 20, yPos);
      yPos += 8;
    }
    
    // Observations
    if (autorizacion.descripcion || autorizacion.observaciones || autorizacion.observacion_prestacion) {
      yPos += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('OBSERVACIONES:', 20, yPos);
      
      yPos += 10;
      pdf.setFont('helvetica', 'normal');
      
      const observations = [
        autorizacion.descripcion,
        autorizacion.observaciones,
        autorizacion.observacion_prestacion
      ].filter(Boolean).join(' | ');
      
      const obsLines = pdf.splitTextToSize(observations, pageWidth - 40);
      pdf.text(obsLines, 20, yPos);
      yPos += obsLines.length * 6;
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, pageHeight - 20);
    pdf.text('Esta autorización es válida únicamente para la prestación especificada', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save PDF
    const fileName = `autorizacion_${autorizacion.numero_autorizacion || autorizacion.id}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    pdf.save(fileName);
  };

  return (
    <Button onClick={generatePDF} variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-2" />
      Generar PDF
    </Button>
  );
};

export default AutorizacionPDF;
