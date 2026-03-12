import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function parseDateMDY(dateStr: string): string | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  
  // Excel serial number
  if (/^\d+$/.test(str)) {
    const serial = parseInt(str);
    const epoch = new Date(1899, 11, 30);
    const date = new Date(epoch.getTime() + serial * 86400000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  const parts = str.split('/');
  if (parts.length === 3) {
    let p0 = parseInt(parts[0]);
    let p1 = parseInt(parts[1]);
    let y = parseInt(parts[2]);
    if (isNaN(p0) || isNaN(p1) || isNaN(y)) return null;
    if (y < 100) y = y <= 30 ? 2000 + y : 1900 + y;
    let m: number, d: number;
    if (p0 > 12) { d = p0; m = p1; }
    else if (p1 > 12) { m = p0; d = p1; }
    else { m = p0; d = p1; } // xlsx default M/D/Y
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  
  return null;
}

const OBRA_SOCIAL_ID = 7; // OSPSIP

const AutoImportPadron: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'importing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState({ created: 0, updated: 0, errors: 0 });
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  const runImport = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/padron-ospsip.xls');
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      setStatus('importing');
      setProgress({ current: 0, total: data.length });

      let created = 0, updated = 0, errors = 0;
      const errList: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          const dni = String(row['Nro. Doc.'] || '').trim();
          if (!dni) { errors++; continue; }

          const apellido = String(row['Apellido'] || '').trim();
          const nombre = String(row['Nombre'] || '').trim();
          const sexo = String(row['Sexo'] || '').trim();
          const fechaNac = parseDateMDY(String(row['Fecha Nac.'] || ''));
          const estadoCivil = String(row['Estado Civil'] || '').trim();
          const cuil = String(row['CUIL'] || '').trim();
          const nacionalidad = String(row['Nacionalidad'] || '').trim();
          const direccion = String(row['Domicilio'] || '').trim();
          const localidad = String(row['Localidad'] || '').trim();
          const provincia = String(row['Provincia'] || '').trim();
          const parentesco = String(row['Parentesco'] || '').trim();
          const cuitTitular = String(row['CUIT Titular'] || '').trim();
          const numeroAfiliado = String(row['Nº Afiliado'] || row['N° Afiliado'] || '').trim();
          const planRaw = String(row['Plan'] || '').trim();

          let plan = planRaw;
          if (planRaw) {
            const pu = planRaw.toUpperCase().replace(/[\s.]/g, '');
            if (pu.includes('SD')) plan = 'PMO SD';
            else if (pu.includes('MT')) plan = 'PMO MT';
            else if (pu.includes('PMO') || pu.includes('COMUN') || pu.includes('GENERAL')) plan = 'PMO';
            else if (pu.includes('DOMESTICO')) plan = 'Servicio Domestico';
            else if (pu.includes('MONOTRIB')) plan = 'Monotributista';
          }

          const patientData = {
            dni, nombre, apellido,
            apellido_y_nombre: `${apellido}, ${nombre}`,
            sexo, fecha_nacimiento: fechaNac,
            estado_civil: estadoCivil,
            tipo_doc: 'DNI', nro_doc: dni,
            cuil_beneficiario: cuil,
            nacionalidad, direccion, localidad, provincia,
            parentesco, cuil_titular: cuitTitular,
            numero_afiliado: numeroAfiliado,
            plan: plan || null,
            obra_social_id: OBRA_SOCIAL_ID,
            consultas_maximas: 999,
            activo: true,
          };

          // Check existing
          const { data: existing } = await supabase
            .from('pacientes')
            .select('id')
            .eq('dni', dni)
            .eq('activo', true)
            .maybeSingle();

          if (existing) {
            const { error: err } = await supabase
              .from('pacientes')
              .update({ ...patientData, updated_at: new Date().toISOString() })
              .eq('id', existing.id);
            if (err) throw err;
            updated++;
          } else {
            const { error: err } = await supabase
              .from('pacientes')
              .insert(patientData);
            if (err) throw err;
            created++;
          }
        } catch (err: any) {
          errors++;
          if (errList.length < 20) errList.push(`Fila ${i + 2}: ${err.message}`);
        }

        if (i % 5 === 0) {
          setProgress({ current: i + 1, total: data.length });
          setResults({ created, updated, errors });
        }
      }

      setProgress({ current: data.length, total: data.length });
      setResults({ created, updated, errors });
      setErrorDetails(errList);
      setStatus('done');
    } catch (err: any) {
      setErrorDetails([err.message]);
      setStatus('error');
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Importar Padrón OSPSIP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'idle' && (
          <Button onClick={runImport} className="w-full" size="lg">
            Iniciar Importación
          </Button>
        )}

        {status === 'loading' && (
          <div className="flex items-center gap-2 justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Leyendo archivo Excel...</span>
          </div>
        )}

        {status === 'importing' && (
          <div className="space-y-3">
            <Progress value={(progress.current / progress.total) * 100} />
            <p className="text-sm text-center text-muted-foreground">
              {progress.current} / {progress.total} registros procesados
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-green-50 p-2 rounded"><strong className="text-green-600">{results.created}</strong><br/>Nuevos</div>
              <div className="bg-blue-50 p-2 rounded"><strong className="text-blue-600">{results.updated}</strong><br/>Actualizados</div>
              <div className="bg-red-50 p-2 rounded"><strong className="text-red-600">{results.errors}</strong><br/>Errores</div>
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Importación completada</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-green-50 p-2 rounded"><strong className="text-green-600">{results.created}</strong><br/>Nuevos</div>
              <div className="bg-blue-50 p-2 rounded"><strong className="text-blue-600">{results.updated}</strong><br/>Actualizados</div>
              <div className="bg-red-50 p-2 rounded"><strong className="text-red-600">{results.errors}</strong><br/>Errores</div>
            </div>
            {errorDetails.length > 0 && (
              <div className="max-h-32 overflow-y-auto bg-red-50 p-2 rounded text-xs text-red-600 space-y-1">
                {errorDetails.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}
            <Button onClick={onDone} className="w-full">Volver al sistema</Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error: {errorDetails[0]}</span>
            </div>
            <Button onClick={runImport} variant="outline" className="w-full">Reintentar</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoImportPadron;
