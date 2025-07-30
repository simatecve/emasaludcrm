
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, CheckCircle, XCircle, Info } from 'lucide-react';
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

  // Generate example CSV data
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
        'Pérez',
        '12345678',
        '1980-05-15',
        '011-1234-5678',
        'juan.perez@email.com',
        'Av. Corrientes 1234, CABA',
        '1',
        '123456789',
        '3',
        '20-12345678-9',
        '20-12345678-9',
        'DNI',
        '12345678',
        'Titular',
        'Titular',
        'PÉREZ, Juan Carlos',
        'M',
        'Casado',
        'Argentina',
        'Buenos Aires',
        'Buenos Aires',
        'Paciente nuevo'
      ],
      [
        'María Elena',
        'González',
        '87654321',
        '1992-08-22',
        '011-8765-4321',
        'maria.gonzalez@email.com',
        'Av. Santa Fe 5678, CABA',
        '2',
        '987654321',
        '2',
        '27-87654321-4',
        '27-87654321-4',
        'DNI',
        '87654321',
        'Titular',
        'Titular',
        'GONZÁLEZ, María Elena',
        'F',
        'Soltera',
        'Argentina',
        'La Plata',
        'Buenos Aires',
        'Control mensual'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...exampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ejemplo_pacientes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV de ejemplo descargado",
      description: "Use este archivo como plantilla para importar pacientes.",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Pacientes desde CSV
          </DialogTitle>
          <DialogDescription>
            Importe pacientes masivamente desde un archivo CSV. Descargue primero el archivo de ejemplo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download example button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Paso 1: Descargue el archivo de ejemplo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={generateExampleCSV}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar CSV de ejemplo
              </Button>
            </CardContent>
          </Card>

          {/* Upload area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Paso 2: Suba su archivo CSV
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">
                        Arrastre su archivo CSV aquí
                      </p>
                      <p className="text-gray-500">o haga clic para seleccionar</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Seleccionar archivo
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
                <CardTitle className="text-sm">Resultados de la importación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{importResults.success} pacientes importados exitosamente</span>
                </div>
                
                {importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>{importResults.errors.length} errores encontrados</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResults.errors.map((error, index) => (
                        <Alert key={index} variant="destructive" className="py-2">
                          <AlertDescription className="text-xs">
                            Fila {error.row}: {error.error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Instrucciones:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Descargue el archivo de ejemplo y úselo como plantilla</li>
                <li>Complete los datos de sus pacientes en el formato CSV</li>
                <li>Los campos requeridos son: nombre, apellido, dni, fecha_nacimiento</li>
                <li>Las fechas deben estar en formato YYYY-MM-DD</li>
                <li>Si no especifica consultas_maximas, se asignará 2 por defecto</li>
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
