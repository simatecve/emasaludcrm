import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const BATCH_SIZE = 50;
const OBRA_SOCIAL_ID = 7;

interface ParsedPatient {
  numero_afiliado: string;
  apellido: string;
  nombre: string;
  sexo: string;
  fecha_nacimiento: string | null;
  estado_civil: string;
  tipo_doc: string;
  nro_doc: string;
  dni: string;
  cuil_beneficiario: string;
  nacionalidad: string;
  direccion: string;
  localidad: string;
  provincia: string;
  parentesco: string;
  cuil_titular: string;
  plan: string;
  obra_social_id: number;
  activo: boolean;
  consultas_maximas: number;
}

function parseDateMDY(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  let month = parseInt(parts[0], 10);
  let day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  
  // Handle 2-digit year
  if (year < 100) {
    year = year > 50 ? 1900 + year : 2000 + year;
  }
  
  // Detect if day/month are swapped (M/D/Y format from Excel)
  if (month > 12 && day <= 12) {
    [month, day] = [day, month];
  }
  
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizePlan(plan: string): string {
  if (!plan) return 'PMO';
  const p = plan.trim().toLowerCase();
  if (p.includes('monotribut')) return 'PMO MT';
  if (p.includes('domestico') || p.includes('doméstico')) return 'PMO SD';
  return 'PMO';
}

function normalizeParentesco(parentesco: string): string {
  if (!parentesco) return '';
  if (parentesco.includes('Titular')) return 'Titular';
  if (parentesco.includes('Conyuge')) return 'Cónyuge';
  if (parentesco.includes('Concubino')) return 'Concubino/a';
  if (parentesco.includes('Hijo')) return 'Hijo/a';
  if (parentesco.includes('Familiar')) return 'Familiar a cargo';
  return parentesco;
}

function parseRow(row: any[]): ParsedPatient | null {
  // Columns: 0=Nº Afiliado, 1=Orden, 2=Apellido, 3=Nombre, 4=Sexo, 5=Fecha Nac., 
  // 6=Edad, 7=Estado Civil, 8=Tipo Doc., 9=Nro. Doc., 10=CUIL, 11=Nacionalidad,
  // 12=Domicilio, 13=Localidad, 14=Provincia, 15=Codigo Postal, 16=Parentesco,
  // 17=CUIT Titular, 18=CUIT Empleador, 19=Tipo Relación, 20=Discapacitado, 21=Plan, 22=Fecha Inicio
  
  const nroDoc = String(row[9] ?? '').trim();
  if (!nroDoc || !nroDoc.match(/^\d+$/)) return null;
  
  const apellido = String(row[2] ?? '').trim().toUpperCase();
  const nombre = String(row[3] ?? '').trim().toUpperCase();
  if (!apellido && !nombre) return null;

  return {
    numero_afiliado: String(row[0] ?? '').trim(),
    apellido,
    nombre,
    sexo: String(row[4] ?? '').trim(),
    fecha_nacimiento: parseDateMDY(String(row[5] ?? '')),
    estado_civil: String(row[7] ?? '').trim(),
    tipo_doc: String(row[8] ?? '').trim(),
    nro_doc: nroDoc,
    dni: nroDoc,
    cuil_beneficiario: String(row[10] ?? '').trim(),
    nacionalidad: String(row[11] ?? '').trim(),
    direccion: String(row[12] ?? '').trim(),
    localidad: String(row[13] ?? '').trim(),
    provincia: String(row[14] ?? '').trim(),
    parentesco: normalizeParentesco(String(row[16] ?? '')),
    cuil_titular: String(row[17] ?? '').trim(),
    plan: normalizePlan(String(row[21] ?? '')),
    obra_social_id: OBRA_SOCIAL_ID,
    activo: true,
    consultas_maximas: 999,
  };
}

const AutoImportPadron: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'processing' | 'done' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ created: 0, updated: 0, errors: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runImport();
  }, []);

  async function runImport() {
    try {
      setStatus('loading');
      const resp = await fetch('/padron-ospsip.xls');
      if (!resp.ok) throw new Error('No se pudo cargar el archivo');
      const arrayBuffer = await resp.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
      
      // Skip header row, parse all data rows
      const patients: ParsedPatient[] = [];
      for (let i = 1; i < rows.length; i++) {
        const parsed = parseRow(rows[i]);
        if (parsed) patients.push(parsed);
      }

      setStats(s => ({ ...s, total: patients.length }));
      setStatus('processing');

      let totalCreated = 0, totalUpdated = 0, totalErrors = 0;
      const errors: string[] = [];

      for (let i = 0; i < patients.length; i += BATCH_SIZE) {
        const batch = patients.slice(i, i + BATCH_SIZE);
        
        for (const patient of batch) {
          try {
            // Check if patient exists by DNI
            const { data: existing } = await supabase
              .from('pacientes')
              .select('id')
              .eq('dni', patient.dni)
              .eq('obra_social_id', OBRA_SOCIAL_ID)
              .maybeSingle();

            if (existing) {
              // Update
              const { error } = await supabase
                .from('pacientes')
                .update({
                  nombre: patient.nombre,
                  apellido: patient.apellido,
                  numero_afiliado: patient.numero_afiliado,
                  sexo: patient.sexo,
                  fecha_nacimiento: patient.fecha_nacimiento,
                  estado_civil: patient.estado_civil,
                  tipo_doc: patient.tipo_doc,
                  nro_doc: patient.nro_doc,
                  cuil_beneficiario: patient.cuil_beneficiario,
                  nacionalidad: patient.nacionalidad,
                  direccion: patient.direccion,
                  localidad: patient.localidad,
                  provincia: patient.provincia,
                  parentesco: patient.parentesco,
                  cuil_titular: patient.cuil_titular,
                  plan: patient.plan,
                  activo: true,
                  consultas_maximas: 999,
                })
                .eq('id', existing.id);
              
              if (error) {
                totalErrors++;
                errors.push(`DNI ${patient.dni}: ${error.message}`);
              } else {
                totalUpdated++;
              }
            } else {
              // Insert
              const { error } = await supabase
                .from('pacientes')
                .insert({
                  nombre: patient.nombre,
                  apellido: patient.apellido,
                  dni: patient.dni,
                  numero_afiliado: patient.numero_afiliado,
                  sexo: patient.sexo,
                  fecha_nacimiento: patient.fecha_nacimiento,
                  estado_civil: patient.estado_civil,
                  tipo_doc: patient.tipo_doc,
                  nro_doc: patient.nro_doc,
                  cuil_beneficiario: patient.cuil_beneficiario,
                  nacionalidad: patient.nacionalidad,
                  direccion: patient.direccion,
                  localidad: patient.localidad,
                  provincia: patient.provincia,
                  parentesco: patient.parentesco,
                  cuil_titular: patient.cuil_titular,
                  plan: patient.plan,
                  obra_social_id: OBRA_SOCIAL_ID,
                  activo: true,
                  consultas_maximas: 999,
                });
              
              if (error) {
                totalErrors++;
                errors.push(`DNI ${patient.dni}: ${error.message}`);
              } else {
                totalCreated++;
              }
            }
          } catch (err: any) {
            totalErrors++;
            errors.push(`DNI ${patient.dni}: ${err.message}`);
          }
        }

        setStats({ created: totalCreated, updated: totalUpdated, errors: totalErrors, total: patients.length });
        setProgress(Math.min(100, Math.round(((i + batch.length) / patients.length) * 100)));
        setErrorDetails(errors.slice(0, 20));
      }

      setStatus('done');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error desconocido');
      setStatus('error');
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <><Loader2 className="h-5 w-5 animate-spin" /> Cargando archivo...</>}
            {status === 'processing' && <><Loader2 className="h-5 w-5 animate-spin" /> Importando pacientes OSPSIP...</>}
            {status === 'done' && <><CheckCircle className="h-5 w-5 text-green-500" /> Importación completada</>}
            {status === 'error' && <><AlertCircle className="h-5 w-5 text-red-500" /> Error</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(status === 'processing' || status === 'done') && (
            <>
              <Progress value={progress} className="w-full" />
              <div className="text-sm space-y-1">
                <p>Total: {stats.total} registros</p>
                <p className="text-green-600">Creados: {stats.created}</p>
                <p className="text-blue-600">Actualizados: {stats.updated}</p>
                {stats.errors > 0 && <p className="text-red-600">Errores: {stats.errors}</p>}
              </div>
              {errorDetails.length > 0 && (
                <div className="text-xs text-red-500 max-h-40 overflow-auto">
                  {errorDetails.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </>
          )}
          {status === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoImportPadron;
