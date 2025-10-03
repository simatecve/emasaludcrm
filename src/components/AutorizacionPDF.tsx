
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
    const marginBottom = 40; // Margen inferior para evitar contenido en el footer
    
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
          const watermarkSize = 120;
          const centerX = pageWidth / 2;
          const centerY = pageHeight / 2;
          
          pdf.saveGraphicsState();
          pdf.setGState(pdf.GState({ opacity: 0.1 }));
          
          pdf.addImage(logoImg, 'PNG', centerX - watermarkSize/2, centerY - watermarkSize/2, watermarkSize, watermarkSize);
          pdf.addImage(logoImg, 'PNG', centerX - watermarkSize/2 + 10, centerY - watermarkSize/2 - 10, watermarkSize, watermarkSize);
          pdf.addImage(logoImg, 'PNG', centerX - watermarkSize/2 - 10, centerY - watermarkSize/2 + 10, watermarkSize, watermarkSize);
          
          pdf.restoreGraphicsState();
        }
        
        // Add logo to PDF (upper left corner)
        const logoWidth = 40;
        const logoHeight = 25;
        pdf.addImage(logoImg, 'PNG', 20, 10, logoWidth, logoHeight);
        
        // Header with company info
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('EMA SALUD', 70, 20);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('AV. LIBERTADOR 457', 70, 27);
        pdf.text('(e) CAPITAL', 70, 32);
        
        // Authorization title and number
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Autorización', pageWidth - 20, 15, { align: 'right' });
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`No Autorización: ${autorizacion.numero_autorizacion || autorizacion.id}`, pageWidth - 20, 25, { align: 'right' });
        
        // Horizontal line
        pdf.line(20, 45, pageWidth - 20, 45);
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    };
    
    // Agregar header en la primera página
    await addPageHeader(true);
    
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
        yPos += 6;
      }

      // Agregar diagnóstico si existe
      if (autorizacion.descripcion) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Diagnóstico:', 20, yPos);
        pdf.setFont('helvetica', 'normal');
        yPos += 6;
        
        // Dividir el texto del diagnóstico en líneas si es muy largo
        const diagnosticoLines = pdf.splitTextToSize(autorizacion.descripcion, pageWidth - 40);
        diagnosticoLines.forEach((line: string) => {
          pdf.text(line, 20, yPos);
          yPos += 5;
        });
        yPos += 5;
      }
    }
    
    // Función para dibujar el header de la tabla
    const drawTableHeader = (startY: number) => {
      pdf.setFillColor(52, 85, 139);
      pdf.rect(20, startY, pageWidth - 40, 12, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Cant', 25, startY + 8);
      pdf.text('Cod', 55, startY + 8);
      pdf.text('Descripcion', 95, startY + 8);
      
      return startY + 12;
    };
    
    // Función para verificar si necesitamos nueva página
    const checkAndAddNewPage = async (requiredSpace: number, currentY: number) => {
      if (currentY + requiredSpace > pageHeight - marginBottom) {
        pdf.addPage();
        await addPageHeader(false);
        return 60; // Retornar nueva posición Y después del header
      }
      return currentY;
    };
    
    // Prestaciones table
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detalles de Prestaciones', 20, yPos);
    yPos += 10;
    
    // Verificar espacio para el header de la tabla
    yPos = await checkAndAddNewPage(20, yPos);
    
    // Table header positions
    const colPositions = [20, 50, 90];
    let tableStartY = yPos;
    yPos = drawTableHeader(yPos);
    
    // Table content
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // Preparar datos de prestaciones
    const prestaciones = autorizacion.prestaciones && autorizacion.prestaciones.length > 0
      ? autorizacion.prestaciones
      : [{ cantidad: 1, prestacion_codigo: 'N/A', prestacion_descripcion: 'Sin prestaciones especificadas' }];
    
    // Renderizar cada fila de prestación con verificación de espacio
    for (let index = 0; index < prestaciones.length; index++) {
      const prestacion = prestaciones[index];
      const cantidad = prestacion.cantidad || 1;
      const codigo = prestacion.prestacion_codigo || '';
      const descripcion = prestacion.prestacion_descripcion || '';
      
      // Calcular altura de la fila
      const maxWidth = 85;
      const descLines = pdf.splitTextToSize(descripcion, maxWidth);
      const rowHeight = Math.max(12, (descLines.length * 5) + 8);
      
      // Verificar si necesitamos nueva página para esta fila
      const newY = await checkAndAddNewPage(rowHeight + 5, yPos);
      
      // Si cambiamos de página, redibujamos el header de la tabla
      if (newY !== yPos) {
        yPos = newY;
        tableStartY = yPos;
        yPos = drawTableHeader(yPos);
      }
      
      // Dibujar fondo alternado
      if (index % 2 === 1) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, yPos, pageWidth - 40, rowHeight, 'F');
      }
      
      // Dibujar contenido de las celdas
      pdf.setTextColor(0, 0, 0);
      
      // Cantidad y código centrados verticalmente
      const textY = yPos + (rowHeight / 2) + 2;
      pdf.text(cantidad.toString(), colPositions[0] + 5, textY);
      pdf.text(codigo, colPositions[1] + 5, textY);
      
      // Descripción con múltiples líneas
      descLines.forEach((line: string, lineIndex: number) => {
        const lineY = yPos + 8 + (lineIndex * 5);
        pdf.text(line, colPositions[2] + 5, lineY);
      });
      
      // Dibujar borde horizontal inferior
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPos + rowHeight, pageWidth - 20, yPos + rowHeight);
      
      // Líneas verticales de la fila
      pdf.line(colPositions[1], yPos, colPositions[1], yPos + rowHeight);
      pdf.line(colPositions[2], yPos, colPositions[2], yPos + rowHeight);
      
      yPos += rowHeight;
    }
    
    // Bordes exteriores de la tabla (izquierdo y derecho)
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, tableStartY, 20, yPos); // Izquierdo
    pdf.line(pageWidth - 20, tableStartY, pageWidth - 20, yPos); // Derecho
    pdf.line(20, tableStartY, pageWidth - 20, tableStartY); // Superior
    pdf.line(20, yPos, pageWidth - 20, yPos); // Inferior final
    
    yPos += 20;
    
    // Verificar espacio para sección de diagnóstico
    yPos = await checkAndAddNewPage(60, yPos);
    
    // Diagnóstico section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Diagnóstico', 20, yPos);
    yPos += 10;
    
    // Crear un rectángulo para el área de escritura del diagnóstico
    pdf.setDrawColor(0, 0, 0);
    pdf.setFillColor(255, 255, 255);
    const diagnosticoBoxHeight = 40;
    pdf.rect(20, yPos, pageWidth - 40, diagnosticoBoxHeight);
    
    // Agregar líneas para escribir dentro del rectángulo
    pdf.setDrawColor(200, 200, 200);
    for (let i = 1; i <= 6; i++) {
      const lineY = yPos + (i * 6);
      if (lineY < yPos + diagnosticoBoxHeight - 2) {
        pdf.line(25, lineY, pageWidth - 25, lineY);
      }
    }
    
    yPos += diagnosticoBoxHeight + 20;
    
    // Verificar espacio para sección de firmas
    yPos = await checkAndAddNewPage(70, yPos);
    
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
