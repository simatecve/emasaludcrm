
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
      
      // Add watermark logo in the center of the page (semi-transparent)
      const watermarkSize = 120;
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      
      // Save current graphics state
      pdf.saveGraphicsState();
      
      // Set transparency for watermark (using setGState)
      pdf.setGState(pdf.GState({ opacity: 0.1 }));
      
      // Add watermark image in center (we'll add multiple rotated copies to simulate rotation effect)
      pdf.addImage(logoImg, 'PNG', centerX - watermarkSize/2, centerY - watermarkSize/2, watermarkSize, watermarkSize);
      
      // Add additional watermark copies with slight offsets to create a subtle rotation effect
      pdf.addImage(logoImg, 'PNG', centerX - watermarkSize/2 + 10, centerY - watermarkSize/2 - 10, watermarkSize, watermarkSize);
      pdf.addImage(logoImg, 'PNG', centerX - watermarkSize/2 - 10, centerY - watermarkSize/2 + 10, watermarkSize, watermarkSize);
      
      // Restore graphics state
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
    if (autorizacion.observaciones) {
      pdf.text(`Observacion: ${autorizacion.observaciones}`, 20, yPos);
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
      
      if (autorizacion.descripcion) {
        pdf.text(`Observaciones: ${autorizacion.descripcion}`, 20, yPos);
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
    
    let totalRowHeight = 0;
    
    // Render prestaciones from the prestaciones array
    if (autorizacion.prestaciones && autorizacion.prestaciones.length > 0) {
      autorizacion.prestaciones.forEach(prestacion => {
        const cantidad = prestacion.cantidad || 1;
        const codigo = prestacion.prestacion_codigo || '';
        const descripcion = prestacion.prestacion_descripcion || '';
        
        pdf.text(cantidad.toString(), colPositions[0] + 5, yPos + 6);
        pdf.text(codigo, colPositions[1] + 5, yPos + 6);
        
        // Handle long descriptions
        const maxWidth = colWidths[2] - 10;
        const descLines = pdf.splitTextToSize(descripcion, maxWidth);
        pdf.text(descLines, colPositions[2] + 5, yPos + 6);
        
        const rowHeight = Math.max(12, (descLines.length * 6) + 6);
        totalRowHeight += rowHeight;
        yPos += rowHeight;
      });
    } else {
      // Fallback si no hay prestaciones
      pdf.text('1', colPositions[0] + 5, yPos + 6);
      pdf.text('N/A', colPositions[1] + 5, yPos + 6);
      pdf.text('Sin prestaciones especificadas', colPositions[2] + 5, yPos + 6);
      totalRowHeight = 12;
      yPos += 12;
    }
    
    // Table border
    const tableHeight = 12 + totalRowHeight;
    pdf.rect(20, tableStartY, pageWidth - 40, tableHeight);
    
    // Vertical lines for table
    pdf.line(colPositions[1], tableStartY, colPositions[1], tableStartY + tableHeight);
    pdf.line(colPositions[2], tableStartY, colPositions[2], tableStartY + tableHeight);
    
    // Move yPos after table
    yPos = tableStartY + tableHeight + 20;
    
    // Signature section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Firmas', 20, yPos);
    yPos += 15;
    
    // Specialist signature
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Firma del Especialista:', 20, yPos);
    pdf.line(20, yPos + 15, 100, yPos + 15); // Signature line
    pdf.text('Aclaración:', 20, yPos + 25);
    pdf.line(20, yPos + 30, 100, yPos + 30); // Name line
    pdf.text('Matrícula:', 20, yPos + 40);
    pdf.line(20, yPos + 45, 100, yPos + 45); // License line
    
    // Patient signature
    pdf.text('Firma del Paciente:', 110, yPos);
    pdf.line(110, yPos + 15, 190, yPos + 15); // Signature line
    pdf.text('Aclaración:', 110, yPos + 25);
    pdf.line(110, yPos + 30, 190, yPos + 30); // Name line
    pdf.text('DNI:', 110, yPos + 40);
    pdf.line(110, yPos + 45, 190, yPos + 45); // DNI line
    
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
