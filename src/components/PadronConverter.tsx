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

  // Parsear "APELLIDO, NOMBRE" o "APELLIDO APELLIDO2, NOMBRE NOMBRE2"
  const parseApellidoYNombre = (nombreCompleto: string): { apellido: string; nombre: string } => {
    if (!nombreCompleto) return { apellido: '', nombre: '' };
    
    const parts = nombreCompleto.split(',');
    if (parts.length >= 2) {
      return {
        apellido: parts[0].trim(),
        nombre: parts.slice(1).join(',').trim()
      };
    }
    // Si no hay coma, intentar dividir por el último espacio
    const words = nombreCompleto.trim().split(' ');
    return {
      apellido: words[0] || '',
      nombre: words.slice(1).join(' ') || ''
    };
  };

  // Convertir fechas de varios formatos a "YYYY-MM-DD"
  const parseFecha = (fechaStr: string): string => {
    if (!fechaStr) return '';
    
    const str = String(fechaStr).trim();
    
    // 1. Si es un número serial de Excel (solo dígitos)
    if (/^\d+$/.test(str)) {
      const excelSerial = parseInt(str);
      // Excel usa 1/1/1900 como día 1 (con bug del año bisiesto 1900)
      const excelEpoch = new Date(1899, 11, 30); // 30 de diciembre de 1899
      const date = new Date(excelEpoch.getTime() + excelSerial * 24 * 60 * 60 * 1000);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
    
    // 2. Si ya está en formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    
    // 3. Formato texto "21-Nov-67" o "1-Apr-24"
    const meses: Record<string, string> = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    
    const parts = str.split('-');
    if (parts.length === 3) {
      const dia = parts[0].padStart(2, '0');
      const mesStr = parts[1].toLowerCase().substring(0, 3);
      const mes = meses[mesStr];
      
      if (mes) {
        let año = parseInt(parts[2]);
        if (año < 100) {
          año = año <= 30 ? 2000 + año : 1900 + año;
        }
        return `${año}-${mes}-${dia}`;
      }
    }
    
    // 4. Fallback: intentar con Date.parse
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) {
      const date = new Date(parsed);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    return '';
  };

  const createAutomaticMapping = (templateCols: string[], padronCols: string[], sampleRow: Record<string, any>): Record<string, string> => {
    const mapping: Record<string, string> = {};
    
    // Mapeos conocidos incluyendo columnas específicas de OSPSIP
    const knownMappings: Record<string, string[]> = {
      'dni': ['DNI', 'NUM_DOC', 'Nro Doc', 'Numero Documento', 'nro_doc', 'Documento', 'NroDocumento'],
      'nombre': ['Nombre', 'Nombres', 'PrimerNombre', 'Primer Nombre'],
      'apellido': ['Apellido', 'Apellidos', 'PrimerApellido', 'Primer Apellido'],
      'fecha_nacimiento': ['F_NAC', 'Fecha Nacimiento', 'Fec Nac', 'FechaNac', 'Fecha de Nacimiento', 'FechaNacimiento', 'Nacimiento'],
      'telefono': ['Telefono', 'Tel', 'Celular', 'Teléfono', 'Movil', 'Móvil'],
      'email': ['Email', 'Mail', 'Correo', 'CorreoElectronico', 'E-mail'],
      'direccion': ['Direccion', 'Domicilio', 'Calle', 'Dirección', 'Dir'],
      'numero_afiliado': ['NUM_FAM', 'Nro Afiliado', 'Numero Afiliado', 'NumAfiliado', 'Afiliado', 'NroAfiliado', 'NumeroAfiliado'],
      'cuil_titular': ['CUIL_FAM', 'CUIL Titular', 'CuilTitular', 'Cuil_Titular'],
      'cuil_beneficiario': ['CUIL', 'CUIL Beneficiario', 'CuilBeneficiario', 'Cuil_Beneficiario', 'CuilBenef'],
      'tipo_doc': ['TD', 'Tipo Doc', 'TipoDoc', 'Tipo Documento', 'TipoDocumento'],
      'nro_doc': ['NUM_DOC', 'Nro Doc', 'NroDoc', 'Numero Doc', 'NumeroDoc'],
      'parentesco': ['PARENTESCO', 'Parentesco', 'Vinculo', 'Vínculo', 'Relacion'],
      'sexo': ['SEXO', 'Sexo', 'Genero', 'Género', 'Gen'],
      'estado_civil': ['Estado Civil', 'EstadoCivil', 'Estado_Civil'],
      'nacionalidad': ['Nacionalidad', 'Nac', 'Pais', 'País'],
      'localidad': ['LOCALID', 'Localidad', 'Ciudad', 'Loc'],
      'provincia': ['PCIA', 'Provincia', 'Prov', 'Estado'],
      'apellido_y_nombre': ['NOMBRE', 'Apellido y Nombre', 'ApellidoYNombre', 'NombreCompleto', 'Nombre Completo'],
      'descripcion_paciente': ['Descripcion', 'Descripción', 'Descripcion Paciente'],
      'observaciones': ['Observaciones', 'Obs', 'Notas', 'Comentarios'],
      'fecha_alta': ['F_ALTA', 'Fecha Alta', 'FechaAlta'],
      'nro_doc_familiar': ['NUM_DOC_FAM', 'Nro Doc Familiar'],
      'tipo_doc_familiar': ['TD_FAM', 'Tipo Doc Familiar']
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
        
        // Obtener valores usando el mapeo
        const getValue = (field: string) => {
          const srcCol = mapping[field];
          return srcCol && row[srcCol] !== undefined ? String(row[srcCol]).trim() : '';
        };
        
        // Procesar apellido_y_nombre (campo NOMBRE del padrón contiene "APELLIDO, NOMBRE")
        const nombreCompleto = getValue('apellido_y_nombre');
        if (nombreCompleto) {
          const parsed = parseApellidoYNombre(nombreCompleto);
          newRow.apellido = parsed.apellido;
          newRow.nombre = parsed.nombre;
          newRow.apellido_y_nombre = nombreCompleto;
        } else {
          // Si no hay nombre completo, usar campos individuales
          newRow.nombre = getValue('nombre');
          newRow.apellido = getValue('apellido');
          if (newRow.apellido && newRow.nombre) {
            newRow.apellido_y_nombre = `${newRow.apellido}, ${newRow.nombre}`;
          }
        }
        
        // DNI - puede venir de NUM_DOC o DNI
        newRow.dni = getValue('dni') || getValue('nro_doc');
        newRow.nro_doc = newRow.dni;
        
        // Fecha de nacimiento - convertir formato
        const fechaNac = getValue('fecha_nacimiento');
        newRow.fecha_nacimiento = parseFecha(fechaNac);
        
        // Otros campos con mapeo directo
        newRow.telefono = getValue('telefono');
        newRow.email = getValue('email');
        newRow.direccion = getValue('direccion');
        newRow.numero_afiliado = getValue('numero_afiliado');
        newRow.cuil_titular = getValue('cuil_titular');
        newRow.cuil_beneficiario = getValue('cuil_beneficiario');
        newRow.parentesco = getValue('parentesco');
        newRow.sexo = getValue('sexo');
        newRow.estado_civil = getValue('estado_civil');
        newRow.nacionalidad = getValue('nacionalidad');
        newRow.localidad = getValue('localidad');
        newRow.provincia = getValue('provincia');
        newRow.observaciones = getValue('observaciones');
        newRow.nro_doc_familiar = getValue('nro_doc_familiar');
        newRow.tipo_doc_familiar = getValue('tipo_doc_familiar');
        
        // Fecha de alta si existe
        const fechaAlta = getValue('fecha_alta');
        if (fechaAlta) {
          newRow.fecha_alta = parseFecha(fechaAlta);
        }
        
        // Valores por defecto
        newRow.obra_social_id = selectedObraSocial ? parseInt(selectedObraSocial) : 1;
        newRow.consultas_maximas = 999;
        newRow.descripcion_paciente = getValue('descripcion_paciente') || '';
        newRow.tipo_doc = getValue('tipo_doc') || 'DNI';
        
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

        // Validar campos requeridos con mensajes específicos
        const missingFields: string[] = [];
        if (!patientData.dni) missingFields.push('DNI');
        if (!patientData.nombre) missingFields.push('Nombre');
        if (!patientData.apellido) missingFields.push('Apellido');
        if (!patientData.fecha_nacimiento) missingFields.push('Fecha Nacimiento');
        
        if (missingFields.length > 0) {
          throw new Error(`Faltan: ${missingFields.join(', ')}`);
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
