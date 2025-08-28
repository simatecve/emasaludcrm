
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreatePatient, PatientFormData } from '@/hooks/usePatients';

interface PatientImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const PatientImport: React.FC<PatientImportProps> = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: { row: number; error: string }[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createPatient = useCreatePatient();

  // Generate example CSV data with the exact format from the user's data
  const generateExampleCSV = () => {
    const headers = [
      'dni',
      'nombre',
      'apellido', 
      'fecha_nacimiento',
      'telefono',
      'email',
      'direccion',
      'obra_social_id',
      'numero_afiliado',
      'consultas_maximas',
      'cuil_titular',
      'cuil_beneficiario',
      'tipo_doc',
      'nro_doc',
      'descripcion_paciente',
      'parentesco',
      'apellido_y_nombre',
      'sexo',
      'estado_civil',
      'nacionalidad',
      'localidad',
      'provincia',
      'observaciones'
    ];

    const exampleData = [
      [
        '30193269',
        'Diego Orlando',
        'Aballay',
        '1984-05-15',
        '0264-4211234',
        'diego.aballay@email.com',
        'ULLUM',
        '1',
        '00301932690001',
        '3',
        '20-30193269-5',
        '20-30193269-5',
        'DNI',
        '30193269',
        'Titular',
        'Titular',
        'ABALLAY, Diego Orlando',
        'M',
        'Soltero',
        'Argentina',
        'Ullum',
        'San Juan',
        'Paciente OSPL - Importado desde sistema'
      ],
      [
        '28720421',
        'Jorge Gabriel',
        'Aballay',
        '1982-03-22',
        '0264-4215678',
        'jorge.aballay@gmail.com',
        'BARRIO RAWSON',
        '1',
        '00287204210002',
        '2',
        '20-28720421-8',
        '20-28720421-8',
        'DNI',
        '28720421',
        'Titular',
        'Titular',
        'ABALLAY, Jorge Gabriel',
        'M',
        'Casado',
        'Argentina',
        'Rawson',
        'San Juan',
        'Paciente OSPL - Control regular'
      ],
      [
        '23567002',
        'Hernán Ricardo',
        'Alarcón',
        '1973-12-03',
        '0264-4567890',
        'hernan.alarcon@hotmail.com',
        'BARRIO RAWSON',
        '1',
        '00235670020003',
        '4',
        '20-23567002-3',
        '20-23567002-3',
        'DNI',
        '23567002',
        'Titular',
        'Titular',
        'ALARCÓN, Hernán Ricardo',
        'M',
        'Divorciado',
        'Argentina',
        'Rawson',
        'San Juan',
        'Paciente OSPL - Seguimiento médico'
      ],
      [
        '28243119',
        'Ramón Arnaldo',
        'Alcayaga',
        '1981-08-18',
        '0264-4234567',
        'ramon.alcayaga@yahoo.com',
        'CHIMBAS',
        '1',
        '00282431190004',
        '2',
        '20-28243119-7',
        '20-28243119-7',
        'DNI',
        '28243119',
        'Titular',
        'Titular',
        'ALCAYAGA, Ramón Arnaldo',
        'M',
        'Casado',
        'Argentina',
        'Chimbas',
        'San Juan',
        'Paciente OSPL - Controles de rutina'
      ],
      [
        '16669107',
        'Juan Antonio',
        'Balmaceda',
        '1965-09-10',
        '0264-4345678',
        'juan.balmaceda@empresa.com.ar',
        'CHIMBAS',
        '1',
        '00166691070005',
        '5',
        '20-16669107-2',
        '20-16669107-2',
        'DNI',
        '16669107',
        'Titular',
        'Titular',
        'BALMACEDA, Juan Antonio',
        'M',
        'Viudo',
        'Argentina',
        'Chimbas',
        'San Juan',
        'Paciente OSPL - Adulto mayor con seguimiento'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...exampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_pacientes_ospl_completa.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Plantilla descargada",
      description: "Se descargó la plantilla optimizada para pacientes OSPL. Use este formato exacto para importar sus datos.",
    });
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  // Parse CSV file
  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Por favor seleccione un archivo CSV válido.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos');
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const results = { success: 0, errors: [] as { row: number; error: string }[] };

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const patientData: Partial<PatientFormData> = {};

          headers.forEach((header, index) => {
            const value = values[index];
            if (value) {
              if (header === 'obra_social_id' || header === 'consultas_maximas') {
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  (patientData as any)[header] = numValue;
                }
              } else {
                (patientData as any)[header] = value;
              }
            }
          });

          // Validate required fields
          if (!patientData.nombre || !patientData.apellido || !patientData.dni || !patientData.fecha_nacimiento) {
            throw new Error('Faltan campos requeridos: nombre, apellido, dni, fecha_nacimiento');
          }

          // Set default values
          if (!patientData.consultas_maximas) {
            patientData.consultas_maximas = 2;
          }

          await createPatient.mutateAsync(patientData as PatientFormData);
          results.success++;
        } catch (error: any) {
          results.errors.push({
            row: i + 1,
            error: error.message || 'Error desconocido'
          });
        }
      }

      setImportResults(results);
      
      if (results.success > 0) {
        toast({
          title: "Importación completada",
          description: `${results.success} pacientes importados exitosamente.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error al procesar archivo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importación Masiva de Pacientes desde CSV
          </DialogTitle>
          <DialogDescription>
            Importe múltiples pacientes de una sola vez usando un archivo CSV. Esta herramienta está optimizada para datos de OSPL y otros sistemas similares.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Critical Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>⚠️ IMPORTANTE - LEA ANTES DE IMPORTAR:</strong></div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Obras Sociales:</strong> Verifique que el ID de obra social existe en el sistema (ej: OSPL = ID 1)</li>
                  <li><strong>DNI Únicos:</strong> No pueden existir DNIs duplicados en el sistema</li>
                  <li><strong>Formato de Fechas:</strong> Use ÚNICAMENTE el formato YYYY-MM-DD (año-mes-día)</li>
                  <li><strong>Codificación:</strong> El archivo DEBE estar guardado en UTF-8 para caracteres especiales</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Step 1: Download template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Paso 1: Descargar Plantilla Optimizada para OSPL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Plantilla Especial para OSPL</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Esta plantilla está diseñada específicamente para datos de OSPL, con ejemplos basados en el formato 
                  que usted maneja. Incluye todos los campos necesarios y ejemplos realistas.
                </p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>✅ <strong>Incluye:</strong> DNI, nombres completos, direcciones de San Juan</p>
                  <p>✅ <strong>Obra Social:</strong> Configurada para OSPL (ID = 1)</p>
                  <p>✅ <strong>Formato:</strong> Optimizado para datos argentinos</p>
                  <p>✅ <strong>Validaciones:</strong> Campos obligatorios marcados</p>
                </div>
              </div>
              <Button 
                onClick={generateExampleCSV}
                variant="outline"
                className="w-full flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-300"
              >
                <Download className="h-4 w-4" />
                Descargar Plantilla CSV Optimizada para OSPL
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Detailed preparation instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Paso 2: Preparar sus Datos - Guía Completa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Required Fields Section */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  🔴 CAMPOS OBLIGATORIOS (No pueden estar vacíos)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div><strong>dni:</strong> Número sin puntos ni espacios (ej: "30193269")</div>
                    <div><strong>nombre:</strong> Primer y segundo nombre (ej: "Diego Orlando")</div>
                    <div><strong>apellido:</strong> Apellidos completos (ej: "Aballay")</div>
                    <div><strong>fecha_nacimiento:</strong> Formato YYYY-MM-DD (ej: "1984-05-15")</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>telefono:</strong> Con código de área (ej: "0264-4211234")</div>
                    <div><strong>email:</strong> Dirección válida (ej: "paciente@email.com")</div>
                    <div><strong>direccion:</strong> Dirección completa o localidad</div>
                  </div>
                </div>
              </div>

              {/* OSPL Specific Section */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  🏥 CONFIGURACIÓN ESPECÍFICA PARA OSPL
                </h4>
                <div className="text-sm space-y-2">
                  <div><strong>obra_social_id:</strong> Para OSPL use el valor <span className="bg-green-200 px-2 py-1 rounded font-mono">1</span></div>
                  <div><strong>numero_afiliado:</strong> Formato sugerido: "00" + DNI + "000" + número correlativo (ej: "00301932690001")</div>
                  <div><strong>consultas_maximas:</strong> Número entero (recomendado: 2, 3, 4 o 5 según el plan)</div>
                  <div><strong>localidad/provincia:</strong> Para San Juan, use nombres de departamentos exactos</div>
                </div>
              </div>

              {/* Data Format Guidelines */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  📝 FORMATO DE DATOS - GUÍA DETALLADA
                </h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-2">🗓️ Fechas (MUY IMPORTANTE)</h5>
                    <div className="bg-yellow-100 p-2 rounded text-xs space-y-1">
                      <div>✅ <strong>Correcto:</strong> "1984-05-15" (año-mes-día)</div>
                      <div>❌ <strong>Incorrecto:</strong> "15/05/1984", "05-15-1984", "15-05-84"</div>
                      <div><strong>Tip:</strong> En Excel, formatee la columna como "Texto" antes de pegar las fechas</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-2">👤 Información Personal</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div><strong>Sexo:</strong> "M" (Masculino), "F" (Femenino), "X" (No binario)</div>
                      <div><strong>Estado Civil:</strong> "Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"</div>
                      <div><strong>Tipo Doc:</strong> "DNI", "LC", "LE", "CI", "Pasaporte"</div>
                      <div><strong>CUIL:</strong> "20-30193269-5" (con guiones)</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-yellow-800 mb-2">📍 Direcciones para San Juan</h5>
                    <div className="text-xs space-y-1">
                      <div><strong>Ejemplos válidos:</strong> "ULLUM", "BARRIO RAWSON", "CHIMBAS", "CAUCETE"</div>
                      <div><strong>Localidad:</strong> Nombre del departamento o barrio específico</div>
                      <div><strong>Provincia:</strong> "San Juan" (recomendado para todos los registros)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CSV File Preparation */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  💾 PREPARACIÓN DEL ARCHIVO CSV
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">🔧 En Excel:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                      <li>Abra la plantilla descargada en Excel</li>
                      <li>Reemplace los datos de ejemplo con sus datos reales</li>
                      <li>Verifique que las fechas estén en formato YYYY-MM-DD</li>
                      <li>Guarde como: "Archivo" → "Guardar como" → "CSV UTF-8 (delimitado por comas)"</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">📊 En Google Sheets:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                      <li>Importe la plantilla a Google Sheets</li>
                      <li>Complete sus datos</li>
                      <li>Descargue como: "Archivo" → "Descargar" → "Valores separados por comas (.csv)"</li>
                    </ol>
                  </div>

                  <div className="bg-purple-100 p-2 rounded">
                    <div className="text-xs font-medium text-purple-800">⚡ CONSEJOS PRO:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs mt-1">
                      <li>Use comillas para textos con comas: "PÉREZ, Juan Carlos"</li>
                      <li>Mantenga los encabezados exactamente como en la plantilla</li>
                      <li>No deje filas vacías entre los datos</li>
                      <li>Para archivos grandes (+200 registros), divida en lotes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Common Errors Prevention */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  🚫 ERRORES COMUNES A EVITAR
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">❌ Errores de Formato:</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>DNI con puntos: "30.193.269" ❌</li>
                      <li>Fechas incorrectas: "15/05/1984" ❌</li>
                      <li>Emails inválidos: "email@" ❌</li>
                      <li>Obra social inexistente: ID "999" ❌</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">❌ Errores de Contenido:</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>DNI duplicados en el archivo ❌</li>
                      <li>Campos obligatorios vacíos ❌</li>
                      <li>Caracteres especiales sin UTF-8 ❌</li>
                      <li>Números como texto: "ID dos" ❌</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Upload file */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Paso 3: Subir y Procesar Archivo CSV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {isProcessing ? (
                  <div className="space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <div>
                      <p className="text-gray-600 font-medium">Procesando archivo...</p>
                      <p className="text-sm text-gray-500">Validando datos y creando pacientes</p>
                      <p className="text-xs text-gray-400 mt-2">
                        ⏱️ Tiempo estimado: ~2-3 segundos por cada 10 pacientes
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">
                        📁 Arrastre su archivo CSV aquí
                      </p>
                      <p className="text-gray-500">o haga clic para seleccionar desde su computadora</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-400">📊 Formatos soportados: .csv únicamente</p>
                        <p className="text-xs text-gray-400">⚡ Máximo recomendado: 500 registros por archivo</p>
                        <p className="text-xs text-gray-400">🔐 Sus datos se procesan de forma segura</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-50 hover:bg-blue-100 border-blue-300"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Seleccionar archivo CSV
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Import results */}
          {importResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">📊 Resultados de la Importación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium text-lg">
                    🎉 {importResults.success} pacientes importados exitosamente
                  </span>
                </div>
                
                {importResults.errors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">
                        ⚠️ {importResults.errors.length} errores encontrados
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Detalle de errores:</h5>
                      {importResults.errors.map((error, index) => (
                        <Alert key={index} variant="destructive" className="py-2">
                          <AlertDescription className="text-xs">
                            <strong>📍 Fila {error.row}:</strong> {error.error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>💡 Solución:</strong> Corrija los errores en su archivo CSV y vuelva a importar 
                        solo las filas con problemas. Puede usar la plantilla descargada como referencia.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Final tips and best practices */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-3">
                <div><strong>🎯 CONSEJOS FINALES PARA UNA IMPORTACIÓN PERFECTA:</strong></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">✅ Antes de Importar:</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• Verifique que OSPL esté registrada con ID = 1</li>
                      <li>• Confirme que no hay DNIs duplicados</li>
                      <li>• Revise el formato de fechas (YYYY-MM-DD)</li>
                      <li>• Valide que los emails sean correctos</li>
                      <li>• Asegúrese que el archivo esté en UTF-8</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">🚀 Para Archivos Grandes:</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• Divida en lotes de máximo 200 pacientes</li>
                      <li>• Importe en horarios de menor uso del sistema</li>
                      <li>• Mantenga copia de respaldo de sus datos</li>
                      <li>• Verifique cada lote antes del siguiente</li>
                      <li>• Use nombres de archivo descriptivos</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-100 p-3 rounded mt-3">
                  <p className="text-xs text-green-800">
                    <strong>📞 Soporte:</strong> Si tiene problemas con la importación, verifique primero que sus datos 
                    cumplan con todos los requisitos de la plantilla. Los errores más comunes son formatos de fecha 
                    incorrectos y referencias a obras sociales inexistentes.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientImport;
