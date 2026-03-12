import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const BATCH_SIZE = 100;
const OBRA_SOCIAL_ID = 7;

const AutoImportPadron: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'processing' | 'done' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ created: 0, updated: 0, errors: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');
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
      const dataRows = rows.slice(1).filter((r: any[]) => r[9] && String(r[9]).match(/^\d+$/));

      setStats(s => ({ ...s, total: dataRows.length }));
      setStatus('processing');

      let totalCreated = 0, totalUpdated = 0, totalErrors = 0;

      for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
        const batch = dataRows.slice(i, i + BATCH_SIZE);
        const lines = batch.map((row: any[]) => '|' + row.map((c: any) => String(c ?? '')).join('|') + '|');

        const { data: result, error } = await supabase.functions.invoke('import-padron', {
          body: { lines, obra_social_id: OBRA_SOCIAL_ID }
        });

        if (error) throw error;
        if (result) {
          totalCreated += result.created || 0;
          totalUpdated += result.updated || 0;
          totalErrors += result.totalErrors || 0;
        }

        setStats({ created: totalCreated, updated: totalUpdated, errors: totalErrors, total: dataRows.length });
        setProgress(Math.min(100, Math.round(((i + batch.length) / dataRows.length) * 100)));
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
            </>
          )}
          {status === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoImportPadron;
