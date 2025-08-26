
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

  // Generate example CSV data with more comprehensive data
  const generateExampleCSV = () => {
    const headers = [
      'nombre',
      'apellido', 
      'dni',
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
        'Juan Carlos',
        'Pérez García',
        '12345678',
        '1980-05-15',
        '011-1234-5678',
        'juan.perez@email.com',
        'Av. Corrientes 1234, Piso 3, Depto A, CABA',
        '1',
        '00123456789001',
        '3',
        '20-12345678-9',
        '20-12345678-9',
        'DNI',
        '12345678',
        'Titular',
        'Titular',
        'PÉREZ GARCÍA, Juan Carlos',
        'M',
        'Casado',
        'Argentina',
        'Ciudad Autónoma de Buenos Aires',
        'Buenos Aires',
        'Paciente derivado por medicina general. Hipertensión controlada.'
      ],
      [
        'María Elena',
        'González López',
        '87654321',
        '1992-08-22',
        '011-8765-4321',
        'maria.gonzalez@gmail.com',
        'Av. Santa Fe 5678, Villa Crespo, CABA',
        '2',
        '00987654321002',
        '2',
        '27-87654321-4',
        '27-87654321-4',
        'DNI',
        '87654321',
        'Titular',
        'Titular',
        'GONZÁLEZ LÓPEZ, María Elena',
        'F',
        'Soltera',
        'Argentina',
        'La Plata',
        'Buenos Aires',
        'Control mensual. Diabetes tipo 2 en tratamiento.'
      ],
      [
        'Roberto',
        'Martínez',
        '45678912',
        '1975-12-03',
        '011-4567-8912',
        'roberto.martinez@hotmail.com',
        'Calle Falsa 123, San Telmo, CABA',
        '1',
        '00456789120003',
        '4',
        '20-45678912-7',
        '20-45678912-7',
        'DNI',
        '45678912',
        'Titular',
        'Titular',
        'MARTÍNEZ, Roberto',
        'M',
        'Divorciado',
        'Argentina',
        'Rosario',
        'Santa Fe',
        'Paciente con antecedentes cardíacos. Requiere seguimiento.'
      ],
      [
        'Ana Sofía',
        'Rodríguez',
        '78945612',
        '2010-03-18',
        '011-7894-5612',
        'sofia.rodriguez@yahoo.com',
        'Pasaje Los Álamos 567, Palermo, CABA',
        '3',
        '00789456120004',
        '1',
        '27-12345678-9',
        '27-78945612-3',
        'DNI',
        '78945612',
        'Hija',
        'Hija',
        'RODRÍGUEZ, Ana Sofía',
        'F',
        'Menor',
        'Argentina',
        'Córdoba',
        'Córdoba',
        'Menor de edad. Controles pediátricos regulares.'
      ],
      [
        'Pedro Luis',
        'Fernández',
        '32165498',
        '1960-09-10',
        '011-3216-5498',
        'pedro.fernandez@empresa.com.ar',
        'Av. Rivadavia 9876, Caballito, CABA',
        '2',
        '00321654980005',
        '5',
        '20-32165498-2',
        '20-32165498-2',
        'DNI',
        '32165498',
        'Titular',
        'Titular',
        'FERNÁNDEZ, Pedro Luis',
        'M',
        'Viudo',
        'Argentina',
        'Mendoza',
        'Mendoza',
        'Adulto mayor. Controles geriátricos. Medicación crónica.'
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
    link.setAttribute('download', 'plantilla_pacientes_ejemplo.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Plantilla descargada",
      description: "Se descargó la plantilla con ejemplos de pacientes. Use este formato para importar sus datos.",
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importación Masiva de Pacientes desde CSV
          </DialogTitle>
          <DialogDescription>
            Importe múltiples pacientes de una sola vez usando un archivo CSV. Siga los pasos a continuación para una importación exitosa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Antes de importar, asegúrese de que las obras sociales referenciadas ya existan en el sistema. 
              Los IDs de obra social deben coincidir con los registros existentes.
            </AlertDescription>
          </Alert>

          {/* Step 1: Download template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Paso 1: Descargar Plantilla de Ejemplo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Descargue la plantilla CSV con ejemplos de datos para entender el formato correcto. 
                Esta plantilla incluye todos los campos disponibles y ejemplos realistas de datos de pacientes.
              </p>
              <Button 
                onClick={generateExampleCSV}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar Plantilla CSV con Ejemplos
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Prepare data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Paso 2: Preparar sus Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Campos Obligatorios:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li><strong>nombre:</strong> Nombre del paciente (ej: "Juan Carlos")</li>
                    <li><strong>apellido:</strong> Apellido del paciente (ej: "Pérez García")</li>
                    <li><strong>dni:</strong> Número de DNI sin puntos (ej: "12345678")</li>
                    <li><strong>fecha_nacimiento:</strong> Formato YYYY-MM-DD (ej: "1980-05-15")</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Campos Importantes:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li><strong>obra_social_id:</strong> ID numérico de la obra social (debe existir en el sistema)</li>
                    <li><strong>consultas_maximas:</strong> Número máximo de consultas (por defecto: 2)</li>
                    <li><strong>telefono:</strong> Con código de área (ej: "011-1234-5678")</li>
                    <li><strong>email:</strong> Dirección de correo electrónico válida</li>
                    <li><strong>direccion:</strong> Dirección completa con detalles</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Formato de Datos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li><strong>Fechas:</strong> Usar formato YYYY-MM-DD (año-mes-día)</li>
                    <li><strong>Sexo:</strong> "M" para Masculino, "F" para Femenino</li>
                    <li><strong>CUIL:</strong> Formato completo con guiones (ej: "20-12345678-9")</li>
                    <li><strong>Números:</strong> Solo dígitos, sin puntos ni espacios en DNI</li>
                    <li><strong>Texto:</strong> Use comillas si contiene comas o caracteres especiales</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Codificación del Archivo:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Guarde el archivo CSV con codificación <strong>UTF-8</strong></li>
                    <li>En Excel: "Guardar como" → "CSV UTF-8 (delimitado por comas)"</li>
                    <li>Verifique que los caracteres especiales (ñ, acentos) se vean correctamente</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Upload file */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Paso 3: Subir Archivo CSV
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
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Procesando archivo...</p>
                    <p className="text-sm text-gray-500">Esto puede tomar unos momentos dependiendo del tamaño del archivo</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">
                        Arrastre su archivo CSV aquí
                      </p>
                      <p className="text-gray-500">o haga clic para seleccionar desde su computadora</p>
                      <p className="text-xs text-gray-400 mt-2">Tamaño máximo recomendado: 1000 registros por archivo</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
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
                <CardTitle className="text-base">Resultados de la Importación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">{importResults.success} pacientes importados exitosamente</span>
                </div>
                
                {importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">{importResults.errors.length} errores encontrados</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {importResults.errors.map((error, index) => (
                        <Alert key={index} variant="destructive" className="py-2">
                          <AlertDescription className="text-xs">
                            <strong>Fila {error.row}:</strong> {error.error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Corrija los errores en su archivo CSV y vuelva a importar solo las filas con problemas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Consejos para una importación exitosa:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                <li>Verifique que todas las obras sociales referenciadas existan antes de importar</li>
                <li>Use la plantilla descargada como base para mantener el formato correcto</li>
                <li>Revise que no haya DNIs duplicados en su archivo</li>
                <li>Verifique las fechas de nacimiento (formato YYYY-MM-DD)</li>
                <li>Para archivos grandes (+500 registros), considere dividirlos en lotes más pequeños</li>
                <li>Mantenga una copia de respaldo de sus datos antes de importar</li>
              </ul>
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
