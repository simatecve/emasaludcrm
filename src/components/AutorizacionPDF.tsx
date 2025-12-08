
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
    const margin = 12; // Márgenes reducidos
    const marginBottom = 15;
    
    // Función para agregar header y logo (reutilizable para nuevas páginas)
    const addPageHeader = async (isFirstPage = false) => {
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = '/lovable-uploads/198ebf3b-34e9-4a8e-8001-363ceb212fd8.png';
        });
        
        if (isFirstPage) {
          // Add watermark logo in the center of the page (semi-transparent)
          const watermarkSize = 100;
          const centerX = pageWidth / 2;
          const centerY = pageHeight / 2;
          
          pdf.saveGraphicsState();
          pdf.setGState(pdf.GState({ opacity: 0.08 }));
          pdf.addImage(logoImg, 'PNG', centerX - watermarkSize/2, centerY - watermarkSize/2, watermarkSize, watermarkSize);
          pdf.restoreGraphicsState();
        }
        
        // Add logo to PDF (upper left corner) - más pequeño
        const logoWidth = 28;
        const logoHeight = 18;
        pdf.addImage(logoImg, 'PNG', margin, 6, logoWidth, logoHeight);
        
        // Header with company info - comprimido en una línea
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('EMA SALUD', margin + logoWidth + 4, 12);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text('San Luis 713 este, esquina calle Guemes - CAPITAL', margin + logoWidth + 4, 18);
        
        // Authorization title and number - comprimido
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Autorización', pageWidth - margin, 10, { align: 'right' });
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`No: ${autorizacion.numero_autorizacion || autorizacion.id}`, pageWidth - margin, 17, { align: 'right' });
        
        // Horizontal line - más arriba
        pdf.line(margin, 24, pageWidth - margin, 24);
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    };
    
    // Agregar header en la primera página
    await addPageHeader(true);
    
    let yPos = 28;
    
    // Patient information - 3 columnas para máxima compresión
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    
    const paciente = autorizacion.pacientes;
    const col1 = margin;
    const col2 = margin + 60;
    const col3 = margin + 130;
    const lineHeight = 3.5;
    
    // Fila 1
    if (autorizacion.prestador) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Prestador:', col1, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(autorizacion.prestador, col1 + 18, yPos);
    }
    if (paciente?.dni) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('DNI:', col2, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(paciente.dni, col2 + 10, yPos);
    }
    if (autorizacion.obras_sociales) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('OS:', col3, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(autorizacion.obras_sociales.nombre.substring(0, 25), col3 + 8, yPos);
    }
    yPos += lineHeight;
    
    // Fila 2
    if (paciente) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Paciente:', col1, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${paciente.apellido.toUpperCase()} ${paciente.nombre.toUpperCase()}`.substring(0, 35), col1 + 16, yPos);
    }
    if (autorizacion.numero_credencial) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cred/Afil:', col2, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(autorizacion.numero_credencial, col2 + 16, yPos);
    }
    if (autorizacion.parentesco_beneficiario) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Parentesco:', col3, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${autorizacion.parentesco_beneficiario} <21`, col3 + 20, yPos);
    }
    yPos += lineHeight;
    
    // Fila 3 - Observaciones y profesional
    if (autorizacion.profesional_solicitante) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Profesional:', col1, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(autorizacion.profesional_solicitante.substring(0, 30), col1 + 20, yPos);
    }
    if (autorizacion.observaciones) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Obs:', col2, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(autorizacion.observaciones.substring(0, 40), col2 + 10, yPos);
    }
    yPos += lineHeight;
    
    // Descripción si existe (en una línea)
    if (autorizacion.descripcion) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Descripción:', col1, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(autorizacion.descripcion.substring(0, 80), col1 + 22, yPos);
      yPos += lineHeight;
    }
    
    yPos += 2;
    
    // Función para dibujar el header de la tabla - más compacto
    const drawTableHeader = (startY: number) => {
      pdf.setFillColor(52, 85, 139);
      pdf.rect(margin, startY, pageWidth - (margin * 2), 6, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('Cant', margin + 3, startY + 4);
      pdf.text('Cod', margin + 20, startY + 4);
      pdf.text('Descripcion', margin + 50, startY + 4);
      
      return startY + 6;
    };
    
    // Función para verificar si necesitamos nueva página
    const checkAndAddNewPage = async (requiredSpace: number, currentY: number) => {
      if (currentY + requiredSpace > pageHeight - marginBottom) {
        pdf.addPage();
        await addPageHeader(false);
        return 28;
      }
      return currentY;
    };
    
    // Prestaciones table - título más pequeño
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('Prestaciones', margin, yPos);
    yPos += 3;
    
    // Table header positions - ajustados a márgenes reducidos
    const colPositions = [margin, margin + 18, margin + 48];
    let tableStartY = yPos;
    yPos = drawTableHeader(yPos);
    
    // Table content
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // Preparar datos de prestaciones
    const prestaciones = autorizacion.prestaciones && autorizacion.prestaciones.length > 0
      ? autorizacion.prestaciones
      : [{ cantidad: 1, prestacion_codigo: 'N/A', prestacion_descripcion: 'Sin prestaciones especificadas' }];
    
    // Renderizar cada fila de prestación
    for (let index = 0; index < prestaciones.length; index++) {
      const prestacion = prestaciones[index];
      const cantidad = prestacion.cantidad || 1;
      const codigo = prestacion.prestacion_codigo || '';
      const descripcion = prestacion.prestacion_descripcion || '';
      
      // Calcular altura de la fila - más compacta
      const maxWidth = pageWidth - margin - colPositions[2] - 5;
      const descLines = pdf.splitTextToSize(descripcion, maxWidth);
      const rowHeight = Math.max(5, (descLines.length * 3) + 2);
      
      // Verificar si necesitamos nueva página
      const newY = await checkAndAddNewPage(rowHeight + 3, yPos);
      
      if (newY !== yPos) {
        yPos = newY;
        tableStartY = yPos;
        yPos = drawTableHeader(yPos);
      }
      
      // Fondo alternado
      if (index % 2 === 1) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');
      }
      
      // Contenido
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(7);
      
      const textY = yPos + 3;
      pdf.text(cantidad.toString(), colPositions[0] + 3, textY);
      pdf.text(codigo, colPositions[1] + 2, textY);
      
      descLines.forEach((line: string, lineIndex: number) => {
        pdf.text(line, colPositions[2] + 2, yPos + 3 + (lineIndex * 3));
      });
      
      // Bordes
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos + rowHeight, pageWidth - margin, yPos + rowHeight);
      pdf.line(colPositions[1], yPos, colPositions[1], yPos + rowHeight);
      pdf.line(colPositions[2], yPos, colPositions[2], yPos + rowHeight);
      
      yPos += rowHeight;
    }
    
    // Bordes exteriores
    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin, tableStartY, margin, yPos);
    pdf.line(pageWidth - margin, tableStartY, pageWidth - margin, yPos);
    pdf.line(margin, tableStartY, pageWidth - margin, tableStartY);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 4;
    
    // Copago - más compacto, en línea
    yPos = await checkAndAddNewPage(10, yPos);
    const formattedCopago = (autorizacion.copago !== null && autorizacion.copago !== undefined)
      ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(autorizacion.copago)
      : '';
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Copago:', margin, yPos);
    pdf.setDrawColor(150, 150, 150);
    pdf.rect(margin + 18, yPos - 4, 35, 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    if (formattedCopago) {
      pdf.text(formattedCopago, margin + 20, yPos);
    }
    
    yPos += 6;
    
    // Diagnóstico - caja más pequeña
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Diagnóstico', margin, yPos);
    yPos += 3;
    
    pdf.setDrawColor(0, 0, 0);
    const diagnosticoBoxHeight = 12;
    pdf.rect(margin, yPos, pageWidth - (margin * 2), diagnosticoBoxHeight);
    
    pdf.setDrawColor(200, 200, 200);
    for (let i = 1; i <= 2; i++) {
      pdf.line(margin + 3, yPos + (i * 4), pageWidth - margin - 3, yPos + (i * 4));
    }
    
    yPos += diagnosticoBoxHeight + 4;
    
    // Verificar espacio para firmas
    if (yPos + 28 > pageHeight - marginBottom) {
      pdf.addPage();
      await addPageHeader(false);
      yPos = 28;
    }
    
    // Firmas - ultra compactas en dos columnas
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Firmas', margin, yPos);
    yPos += 4;
    
    const signCol1 = margin;
    const signCol2 = pageWidth / 2 + 5;
    const signWidth = (pageWidth / 2) - margin - 10;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    
    // Especialista
    pdf.text('Firma Especialista:', signCol1, yPos);
    pdf.line(signCol1, yPos + 8, signCol1 + signWidth, yPos + 8);
    pdf.text('Aclaración:', signCol1, yPos + 12);
    pdf.line(signCol1, yPos + 16, signCol1 + signWidth, yPos + 16);
    pdf.text('Matrícula:', signCol1, yPos + 20);
    pdf.line(signCol1, yPos + 24, signCol1 + signWidth, yPos + 24);
    
    // Paciente
    pdf.text('Firma Paciente:', signCol2, yPos);
    pdf.line(signCol2, yPos + 8, signCol2 + signWidth, yPos + 8);
    pdf.text('Aclaración:', signCol2, yPos + 12);
    pdf.line(signCol2, yPos + 16, signCol2 + signWidth, yPos + 16);
    pdf.text('DNI:', signCol2, yPos + 20);
    pdf.line(signCol2, yPos + 24, signCol2 + signWidth, yPos + 24);
    
    // Footer - más compacto
    const footerY = pdf.internal.pageSize.getHeight() - 8;
    pdf.setFontSize(6);
    pdf.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, margin, footerY);
    
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
