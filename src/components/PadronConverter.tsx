import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, ArrowRight, Database, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCreatePatient, PatientFormData } from '@/hooks/usePatients';
import { useObrasSociales } from '@/hooks/useObrasSociales';

interface PadronConverterProps {
  onClose?: () => void;
}

interface MappingData {
  mapping: Record<string, string>;
  templateColumns: string[];
  padronColumns: string[];
  padronData: Record<string, any>[];
}

interface AnalysisResult {
  template: {
    columns: string[];
    sample: Record<string, any>[];
  };
  padron: {
    columns: string[];
    sample: Record<string, any>[];
    totalRows: number;
  };
}

const PadronConverter: React.FC<PadronConverterProps> = ({ onClose }) => {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [padronFile, setPadronFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mappingData, setMappingData] = useState<MappingData | null>(null);
  const [convertedData, setConvertedData] = useState<Record<string, any>[] | null>(null);
  const [selectedObraSocial, setSelectedObraSocial] = useState<string>('');
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; errors: { row: number; error: string }[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const templateInputRef = useRef<HTMLInputElement>(null);
  const padronInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const createPatient = useCreatePatient();
  const { data: obrasSociales } = useObrasSociales();

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateFile(file);
      setError(null);
      setResult(null);
      setMappingData(null);
      setConvertedData(null);
    }
  };

  const handlePadronUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPadronFile(file);
      setError(null);
      setResult(null);
      setMappingData(null);
      setConvertedData(null);
    }
  };

  const generateTemplateCSV = () => {
    const headers = [
      'dni', 'nombre', 'apellido', 'fecha_nacimiento', 'telefono', 'email',
      'direccion', 'obra_social_id', 'numero_afiliado', 'consultas_maximas',
      'cuil_titular', 'cuil_beneficiario', 'tipo_doc', 'nro_doc',
      'descripcion_paciente', 'parentesco', 'apellido_y_nombre', 'sexo',
      'estado_civil', 'nacionalidad', 'localidad', 'provincia', 'observaciones'
    ];

    const csvContent = headers.join(',');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_pacientes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Plantilla descargada",
      description: "Use esta plantilla como referencia para el mapeo de columnas.",
    });
  };

  const createAutomaticMapping = (templateCols: string[], padronCols: string[], sampleRow: Record<string, any>): Record<string, string> => {
    const mapping: Record<string, string> = {};
    
    const knownMappings: Record<string, string[]> = {
      'dni': ['DNI', 'Nro Doc', 'Numero Documento', 'nro_doc', 'Documento', 'NroDocumento'],
      'nombre': ['Nombre', 'Nombres', 'PrimerNombre', 'Primer Nombre'],
      'apellido': ['Apellido', 'Apellidos', 'PrimerApellido', 'Primer Apellido'],
      'fecha_nacimiento': ['Fecha Nacimiento', 'Fec Nac', 'FechaNac', 'Fecha de Nacimiento', 'FechaNacimiento', 'Nacimiento'],
      'telefono': ['Telefono', 'Tel', 'Celular', 'Teléfono', 'Movil', 'Móvil'],
      'email': ['Email', 'Mail', 'Correo', 'CorreoElectronico', 'E-mail'],
      'direccion': ['Direccion', 'Domicilio', 'Calle', 'Dirección', 'Dir'],
      'numero_afiliado': ['Nro Afiliado', 'Numero Afiliado', 'NumAfiliado', 'Afiliado', 'NroAfiliado', 'NumeroAfiliado'],
      'cuil_titular': ['CUIL Titular', 'CuilTitular', 'Cuil_Titular'],
      'cuil_beneficiario': ['CUIL Beneficiario', 'CuilBeneficiario', 'CUIL', 'Cuil_Beneficiario', 'CuilBenef'],
      'tipo_doc': ['Tipo Doc', 'TipoDoc', 'Tipo Documento', 'TipoDocumento'],
      'nro_doc': ['Nro Doc', 'NroDoc', 'Numero Doc', 'NumeroDoc'],
      'parentesco': ['Parentesco', 'Vinculo', 'Vínculo', 'Relacion'],
      'sexo': ['Sexo', 'Genero', 'Género', 'Gen'],
      'estado_civil': ['Estado Civil', 'EstadoCivil', 'Estado_Civil'],
      'nacionalidad': ['Nacionalidad', 'Nac', 'Pais', 'País'],
      'localidad': ['Localidad', 'Ciudad', 'Loc'],
      'provincia': ['Provincia', 'Prov', 'Estado'],
      'apellido_y_nombre': ['Apellido y Nombre', 'ApellidoYNombre', 'NombreCompleto', 'Nombre Completo'],
      'descripcion_paciente': ['Descripcion', 'Descripción', 'Descripcion Paciente'],
      'observaciones': ['Observaciones', 'Obs', 'Notas', 'Comentarios']
    };

    for (const [templateCol, possibleNames] of Object.entries(knownMappings)) {
      for (const padronCol of padronCols) {
        const padronColLower = padronCol.toLowerCase().trim();
        if (possibleNames.some(name => 
          padronColLower === name.toLowerCase() ||
          padronColLower.includes(name.toLowerCase()) ||
          name.toLowerCase().includes(padronColLower)
        )) {
          if (!mapping[templateCol]) {
            mapping[templateCol] = padronCol;
          }
          break;
        }
      }
    }

    return mapping;
  };

  // Columnas predefinidas del sistema para cuando no se usa plantilla o está vacía
  const defaultTemplateColumns = [
    'dni', 'nombre', 'apellido', 'fecha_nacimiento', 'telefono', 'email',
    'direccion', 'obra_social_id', 'numero_afiliado', 'consultas_maximas',
    'cuil_titular', 'cuil_beneficiario', 'tipo_doc', 'nro_doc',
    'descripcion_paciente', 'parentesco', 'apellido_y_nombre', 'sexo',
    'estado_civil', 'nacionalidad', 'localidad', 'provincia', 'observaciones'
  ];

  const analyzeFiles = async () => {
    if (!padronFile) {
      setError('Por favor sube el archivo del padrón primero');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      let templateColumns: string[] = [];

      // Si hay plantilla, intentar leerla
      if (templateFile) {
        const templateText = await templateFile.text();
        const templateParsed = Papa.parse<Record<string, any>>(templateText, { 
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false
        });

        // Obtener columnas del header del CSV (meta.fields contiene los headers)
        if (templateParsed.meta && templateParsed.meta.fields && templateParsed.meta.fields.length > 0) {
          templateColumns = templateParsed.meta.fields;
        } else if (templateParsed.data[0]) {
          templateColumns = Object.keys(templateParsed.data[0]);
        }
      }
      
      // Si no hay columnas de la plantilla, usar las predefinidas
      if (templateColumns.length === 0) {
        templateColumns = defaultTemplateColumns;
      }

      // Read Excel padron
      const padronBuffer = await padronFile.arrayBuffer();
      const workbook = XLSX.read(padronBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const padronData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);

      const padronColumns = padronData.length > 0 ? Object.keys(padronData[0]) : [];

      setResult({
        template: {
          columns: templateColumns,
          sample: []
        },
        padron: {
          columns: padronColumns,
          sample: padronData.slice(0, 2),
          totalRows: padronData.length
        }
      });

      const mapping = createAutomaticMapping(templateColumns, padronColumns, padronData[0] || {});
      setMappingData({
        mapping,
        templateColumns,
        padronColumns,
        padronData
      });

    } catch (err: any) {
      setError(`Error analizando archivos: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const updateMapping = (templateCol: string, padronCol: string) => {
    if (!mappingData) return;
    setMappingData({
      ...mappingData,
      mapping: {
        ...mappingData.mapping,
        [templateCol]: padronCol
      }
    });
  };

  const convertData = () => {
    if (!mappingData) {
      setError('Primero analiza los archivos');
      return;
    }

    setProcessing(true);
    try {
      const { mapping, padronData } = mappingData;
      
      const converted = padronData.map(row => {
        const newRow: Record<string, any> = {};
        
        // Usar las columnas mapeadas directamente
        for (const [destCol, srcCol] of Object.entries(mapping)) {
          if (srcCol && row[srcCol] !== undefined) {
            newRow[destCol] = row[srcCol];
          }
        }
        
        // Establecer valores por defecto
        newRow.obra_social_id = selectedObraSocial ? parseInt(selectedObraSocial) : 1;
        newRow.consultas_maximas = newRow.consultas_maximas || 999;
        newRow.descripcion_paciente = newRow.descripcion_paciente || '';
        newRow.observaciones = newRow.observaciones || '';
        
        // Construir apellido_y_nombre si tenemos apellido y nombre
        if (!newRow.apellido_y_nombre && newRow.apellido && newRow.nombre) {
          newRow.apellido_y_nombre = `${newRow.apellido}, ${newRow.nombre}`;
        }
        
        // Asegurar tipo_doc por defecto
        if (!newRow.tipo_doc) {
          newRow.tipo_doc = 'DNI';
        }
        
        // Si no hay nro_doc pero hay dni, usar dni
        if (!newRow.nro_doc && newRow.dni) {
          newRow.nro_doc = newRow.dni;
        }
        
        return newRow;
      });

      setConvertedData(converted);
      setError(null);
      toast({
        title: "Datos convertidos",
        description: `${converted.length} registros listos para importar o descargar.`,
      });
    } catch (err: any) {
      setError(`Error convirtiendo datos: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const downloadCSV = () => {
    if (!convertedData) return;

    const csv = Papa.unparse(convertedData);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `padron_convertido_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV descargado",
      description: "El archivo CSV convertido ha sido descargado.",
    });
  };

  const importToDatabase = async () => {
    if (!convertedData || convertedData.length === 0) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: convertedData.length, errors: [] });

    const errors: { row: number; error: string }[] = [];
    let successCount = 0;

    for (let i = 0; i < convertedData.length; i++) {
      const row = convertedData[i];
      
      try {
        const patientData: Partial<PatientFormData> = {
          dni: row.dni?.toString() || '',
          nombre: row.nombre || '',
          apellido: row.apellido || '',
          fecha_nacimiento: row.fecha_nacimiento || '',
          telefono: row.telefono || '',
          email: row.email || '',
          direccion: row.direccion || '',
          obra_social_id: parseInt(row.obra_social_id) || (selectedObraSocial ? parseInt(selectedObraSocial) : undefined),
          numero_afiliado: row.numero_afiliado || '',
          consultas_maximas: parseInt(row.consultas_maximas) || 999,
          cuil_titular: row.cuil_titular || '',
          cuil_beneficiario: row.cuil_beneficiario || '',
          tipo_doc: row.tipo_doc || 'DNI',
          nro_doc: row.nro_doc || row.dni?.toString() || '',
          descripcion_paciente: row.descripcion_paciente || '',
          parentesco: row.parentesco || '',
          apellido_y_nombre: row.apellido_y_nombre || '',
          sexo: row.sexo || '',
          estado_civil: row.estado_civil || '',
          nacionalidad: row.nacionalidad || '',
          localidad: row.localidad || '',
          provincia: row.provincia || '',
          observaciones: row.observaciones || ''
        };

        if (!patientData.dni || !patientData.nombre || !patientData.apellido || !patientData.fecha_nacimiento) {
          throw new Error('Faltan campos requeridos: dni, nombre, apellido, fecha_nacimiento');
        }

        await createPatient.mutateAsync(patientData as PatientFormData);
        successCount++;
      } catch (err: any) {
        errors.push({ row: i + 2, error: err.message || 'Error desconocido' });
      }

      setImportProgress({ current: i + 1, total: convertedData.length, errors });
    }

    setIsImporting(false);

    toast({
      title: "Importación completada",
      description: `${successCount} pacientes importados. ${errors.length} errores.`,
      variant: errors.length > 0 ? "destructive" : "default",
    });
  };

  const resetAll = () => {
    setTemplateFile(null);
    setPadronFile(null);
    setResult(null);
    setMappingData(null);
    setConvertedData(null);
    setError(null);
    setImportProgress(null);
    setSelectedObraSocial('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Conversor de Padrón Excel</h2>
          <p className="text-sm text-muted-foreground">
            Transforma archivos Excel al formato de la base de datos
          </p>
        </div>
      </div>

      {/* Obra Social Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Obra Social Destino</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedObraSocial} onValueChange={setSelectedObraSocial}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar obra social..." />
            </SelectTrigger>
            <SelectContent>
              {obrasSociales?.map((os) => (
                <SelectItem key={os.id} value={os.id.toString()}>
                  {os.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Template */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">1</div>
              Plantilla CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
              <input
                ref={templateInputRef}
                type="file"
                accept=".csv"
                onChange={handleTemplateUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                onClick={() => templateInputRef.current?.click()}
                className="w-full h-auto flex-col py-4"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm">Seleccionar Plantilla CSV</span>
              </Button>
              {templateFile && (
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {templateFile.name}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={generateTemplateCSV} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Descargar plantilla vacía
            </Button>
          </CardContent>
        </Card>

        {/* Padron */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">2</div>
              Padrón Excel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
              <input
                ref={padronInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handlePadronUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                onClick={() => padronInputRef.current?.click()}
                className="w-full h-auto flex-col py-4"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm">Seleccionar Padrón Excel</span>
              </Button>
              {padronFile && (
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {padronFile.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button - Solo requiere padrón, plantilla es opcional */}
      <Button
        onClick={analyzeFiles}
        disabled={!padronFile || processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analizando archivos...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Analizar y Mapear Columnas
          </>
        )}
      </Button>
      
      {!templateFile && (
        <p className="text-xs text-muted-foreground text-center">
          La plantilla es opcional. Si no se sube, se usarán las columnas predefinidas del sistema.
        </p>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resumen del Análisis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{result.padron.totalRows}</div>
                  <div className="text-xs text-muted-foreground">Afiliados</div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{result.template.columns.length}</div>
                  <div className="text-xs text-muted-foreground">Columnas Destino</div>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.padron.columns.length}</div>
                  <div className="text-xs text-muted-foreground">Columnas Origen</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapping Preview */}
          {mappingData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Mapeo de Columnas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {mappingData.templateColumns.map((templateCol) => (
                    <div key={templateCol} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                      <Select
                        value={mappingData.mapping[templateCol] || '__none__'}
                        onValueChange={(value) => updateMapping(templateCol, value === '__none__' ? '' : value)}
                      >
                        <SelectTrigger className="flex-1 h-8 text-xs">
                          <SelectValue placeholder="Seleccionar columna..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">-- Sin mapear --</SelectItem>
                          {mappingData.padronColumns.map((col) => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 font-mono text-xs text-primary font-medium truncate">
                        {templateCol}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={convertData}
                  disabled={processing}
                  className="w-full"
                  variant="secondary"
                >
                  {processing ? 'Convirtiendo...' : 'Convertir Datos'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Converted Data Actions */}
          {convertedData && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Conversión Exitosa - {convertedData.length} registros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isImporting && importProgress && (
                  <div className="space-y-2">
                    <Progress value={(importProgress.current / importProgress.total) * 100} />
                    <p className="text-xs text-muted-foreground text-center">
                      Importando {importProgress.current} de {importProgress.total}...
                    </p>
                  </div>
                )}

                {importProgress && !isImporting && importProgress.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-red-50 p-2 rounded">
                    {importProgress.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-xs text-red-600">
                        Fila {err.row}: {err.error}
                      </p>
                    ))}
                    {importProgress.errors.length > 10 && (
                      <p className="text-xs text-red-600 font-medium">
                        ...y {importProgress.errors.length - 10} errores más
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={downloadCSV} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar CSV
                  </Button>
                  <Button 
                    onClick={importToDatabase} 
                    disabled={isImporting}
                    className="flex-1"
                  >
                    {isImporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4 mr-2" />
                    )}
                    Importar a BD
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reset Button */}
      {(result || error) && (
        <Button variant="ghost" onClick={resetAll} className="w-full">
          Reiniciar proceso
        </Button>
      )}
    </div>
  );
};

export default PadronConverter;
