
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { Autorizacion } from '@/hooks/useAutorizaciones';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSystemConfig } from '@/hooks/useSystemConfig';

interface AutorizacionPDFProps {
  autorizacion: Autorizacion;
}

const AutorizacionPDF = ({ autorizacion }: AutorizacionPDFProps) => {
  const { data: systemConfig } = useSystemConfig();
  
  const generatePDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Load and add logo image
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    try {
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/lovable-uploads/198ebf3b-34e9-4a8e-8001-363ceb212fd8.png';
      });
      
      // Add watermark logo in the center of the page (rotated and semi-transparent)
      const watermarkSize = 120;
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      
      // Save current state
      pdf.saveGraphicsState();
      
      // Set transparency for watermark
      pdf.setGState(pdf.GState({ opacity: 0.1 }));
      
      // Rotate and add watermark using transform
      pdf.setTextColor(200, 200, 200);
      
      // Apply rotation transformation (45 degrees in radians)
      const angle = 45 * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // Transform matrix for rotation around center point
      pdf.setTransformMatrix(cos, sin, -sin, cos, centerX - centerX * cos + centerY * sin, centerY - centerX * sin - centerY * cos);
      
      pdf.addImage(logoImg, 'PNG', centerX - watermarkSize/2, centerY - watermarkSize/2, watermarkSize, watermarkSize);
      
      // Restore normal state
      pdf.restoreGraphicsState();
      
      // Add logo to PDF (upper left corner - normal logo)
      const logoWidth = 40;
      const logoHeight = 25;
      pdf.addImage(logoImg, 'PNG', 20, 10, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
    
    // Header with company info (adjusted for logo)
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    
    // Company name (moved right to accommodate logo)
    pdf.text('EMA SALUD', 70, 20);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AV. LIBERTADOR 457', 70, 27);
    pdf.text('(e) CAPITAL', 70, 32);
    
    // Authorization title and number (moved to upper right)
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Autorización', pageWidth - 20, 15, { align: 'right' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`No Autorización: ${autorizacion.numero_autorizacion || autorizacion.id}`, pageWidth - 20, 25, { align: 'right' });
    
    // Horizontal line (moved down to accommodate logo)
    pdf.line(20, 45, pageWidth - 20, 45);
    
    let yPos = 60;
    
    // Prestador and Observacion
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (autorizacion.prestador) {
      pdf.text(`Prestador: ${autorizacion.prestador}`, 20, yPos);
      yPos += 6;
    }
    if (autorizacion.observaciones || autorizacion.observacion_prestacion) {
      const obs = autorizacion.observaciones || autorizacion.observacion_prestacion || '';
      pdf.text(`Observacion: ${obs}`, 20, yPos);
      yPos += 10;
    }
    
    // Patient information
    const paciente = autorizacion.pacientes;
    if (paciente) {
      pdf.text(`Nombre y Apellido: ${paciente.apellido.toUpperCase()} ${paciente.nombre.toUpperCase()} ${paciente.apellido} ${paciente.dni ? `Dni: ${paciente.dni}` : ''}`, 20, yPos);
      yPos += 6;
      
      if (autorizacion.numero_credencial) {
        pdf.text(`Nro Cred./Afil: ${autorizacion.numero_credencial}`, 20, yPos);
      }
      if (autorizacion.parentesco_beneficiario) {
        pdf.text(`Parentesco: ${autorizacion.parentesco_beneficiario} < 21 años`, pageWidth - 100, yPos, { align: 'right' });
      }
      yPos += 6;
      
      if (autorizacion.descripcion || autorizacion.observacion_prestacion) {
        const desc = autorizacion.descripcion || autorizacion.observacion_prestacion || '';
        pdf.text(`Observaciones: ${desc}`, 20, yPos);
        yPos += 6;
      }
      
      if (autorizacion.obras_sociales) {
        pdf.text(`Obra Social: ${autorizacion.obras_sociales.nombre}`, 20, yPos);
        yPos += 6;
      }
      
      if (autorizacion.profesional_solicitante) {
        pdf.text(`Profesional: ${autorizacion.profesional_solicitante}`, 20, yPos);
        yPos += 10;
      }
    }
    
    // Prestaciones table
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detalles de Prestaciones', 20, yPos);
    yPos += 10;
    
    // Table header
    const tableStartY = yPos;
    const colWidths = [30, 40, 120];
    const colPositions = [20, 50, 90];
    
    pdf.setFillColor(52, 85, 139); // Blue background
    pdf.rect(20, yPos, pageWidth - 40, 12, 'F');
    
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Cant', colPositions[0] + 5, yPos + 8);
    pdf.text('Cod', colPositions[1] + 5, yPos + 8);
    pdf.text('Descripcion', colPositions[2] + 5, yPos + 8);
    
    yPos += 12;
    
    // Table content
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.setFont('helvetica', 'normal');
    
    const cantidad = autorizacion.prestacion_cantidad || 1;
    const codigo = autorizacion.prestacion_codigo || '';
    const descripcion = autorizacion.prestacion_descripcion || '';
    
    pdf.text(cantidad.toString(), colPositions[0] + 5, yPos + 6);
    pdf.text(codigo, colPositions[1] + 5, yPos + 6);
    
    // Handle long descriptions
    const maxWidth = colWidths[2] - 10;
    const descLines = pdf.splitTextToSize(descripcion, maxWidth);
    pdf.text(descLines, colPositions[2] + 5, yPos + 6);
    
    // Table border
    const tableHeight = 12 + (descLines.length * 6) + 6;
    pdf.rect(20, tableStartY, pageWidth - 40, tableHeight);
    
    // Vertical lines for table
    pdf.line(colPositions[1], tableStartY, colPositions[1], tableStartY + tableHeight);
    pdf.line(colPositions[2], tableStartY, colPositions[2], tableStartY + tableHeight);
    
    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 30;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, footerY);
    
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
