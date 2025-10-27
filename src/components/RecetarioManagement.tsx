import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  useRecetarioConfig, 
  useRecetariosDelMes, 
  useEmitirRecetario,
  useRecetarios,
  useDeleteRecetario
} from '@/hooks/useRecetarios';
import { usePatients } from '@/hooks/usePatients';
import PatientSelector from './PatientSelector';
import { 
  FileText, 
  Printer, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  History
} from 'lucide-react';
import { generarRecetarioPDF } from './RecetarioPDF';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LIMITE_RECETARIOS_MENSUAL = 2;

export const RecetarioManagement = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);

  const { data: patients } = usePatients();
  const { data: recetariosDelMes } = useRecetariosDelMes(selectedPatientId);
  const { data: todosRecetarios } = useRecetarios();
  const emitirRecetario = useEmitirRecetario();
  const deleteRecetario = useDeleteRecetario();

  const selectedPatient = patients?.find(p => p.id === selectedPatientId);
  const { data: recetarioConfig } = useRecetarioConfig(selectedPatient?.obra_social_id || null);

  const recetariosUsados = recetariosDelMes?.length || 0;
  const puedeEmitir = recetariosUsados < LIMITE_RECETARIOS_MENSUAL;

  const handleEmitirRecetario = async () => {
    if (!selectedPatient || !recetarioConfig) return;

    await emitirRecetario.mutateAsync({
      paciente_id: selectedPatient.id,
      obra_social_id: selectedPatient.obra_social_id!,
      tipo_recetario: recetarioConfig.tipo_recetario,
      observaciones: observaciones || undefined,
    });

    // Limpiar observaciones después de emitir
    setObservaciones('');
  };

  const handleImprimirRecetario = () => {
    if (!selectedPatient || !recetarioConfig) return;

    generarRecetarioPDF({
      paciente: {
        nombre: selectedPatient.nombre || '',
        apellido: selectedPatient.apellido || '',
        dni: selectedPatient.dni || '',
        numero_afiliado: selectedPatient.numero_afiliado || undefined,
      },
      obraSocial: {
        nombre: selectedPatient.obra_social?.nombre || '',
      },
      tipoRecetario: recetarioConfig.tipo_recetario,
      fecha: new Date().toISOString(),
      observaciones: observaciones || undefined,
    });
  };

  const handleEmitirYImprimir = async () => {
    await handleEmitirRecetario();
    handleImprimirRecetario();
  };

  const handleDelete = async (recetarioId: string) => {
    await deleteRecetario.mutateAsync(recetarioId);
  };

  if (showHistorial) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Historial de Recetarios</h2>
            <p className="text-muted-foreground mt-1">
              Registro completo de recetarios emitidos
            </p>
          </div>
          <Button onClick={() => setShowHistorial(false)} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Volver a Emisión
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Obra Social</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todosRecetarios?.map((recetario) => (
                  <TableRow key={recetario.id}>
                    <TableCell>
                      {format(new Date(recetario.fecha_emision), "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {recetario.pacientes?.nombre} {recetario.pacientes?.apellido}
                    </TableCell>
                    <TableCell>{recetario.pacientes?.dni}</TableCell>
                    <TableCell>{recetario.obras_sociales?.nombre}</TableCell>
                    <TableCell>{recetario.recetarios_tipos?.nombre}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {recetario.observaciones || '-'}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar recetario?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El recetario será eliminado permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(recetario.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestión de Recetarios</h2>
          <p className="text-muted-foreground mt-1">
            Emite recetarios médicos según la obra social del paciente
          </p>
        </div>
        <Button onClick={() => setShowHistorial(true)} variant="outline">
          <History className="h-4 w-4 mr-2" />
          Ver Historial
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Emisión de Recetario
          </CardTitle>
          <CardDescription>
            Selecciona un paciente para emitir su recetario médico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de Paciente */}
          <div>
            <Label>Paciente</Label>
            <PatientSelector
              patients={patients || []}
              selectedPatientId={selectedPatientId || undefined}
              onSelect={setSelectedPatientId}
            />
          </div>

          {selectedPatient && (
            <>
              {/* Información del Paciente y Obra Social */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                  <p className="text-lg font-semibold">
                    {selectedPatient.nombre} {selectedPatient.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">DNI: {selectedPatient.dni}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Obra Social</p>
                  <p className="text-lg font-semibold">
                    {selectedPatient.obra_social?.nombre || 'Sin obra social'}
                  </p>
                  {recetarioConfig && (
                    <p className="text-sm text-muted-foreground">
                      Tipo de recetario: {recetarioConfig.tipo_recetario}
                    </p>
                  )}
                </div>
              </div>

              {/* Contador de Recetarios del Mes */}
              <Card className={puedeEmitir ? 'border-green-500' : 'border-red-500'}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {puedeEmitir ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Recetarios usados este mes
                        </p>
                        <p className="text-3xl font-bold">
                          {recetariosUsados} de {LIMITE_RECETARIOS_MENSUAL}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alert si no puede emitir */}
              {!puedeEmitir && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Límite mensual alcanzado. Este paciente ya utilizó los {LIMITE_RECETARIOS_MENSUAL} recetarios permitidos para este mes.
                  </AlertDescription>
                </Alert>
              )}

              {/* Alert si no tiene configuración de recetario */}
              {!recetarioConfig && selectedPatient.obra_social_id && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    La obra social de este paciente no tiene un tipo de recetario configurado.
                    Contacte al administrador.
                  </AlertDescription>
                </Alert>
              )}

              {/* Observaciones */}
              <div>
                <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Ingrese observaciones sobre este recetario..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Botón de Imprimir */}
              <Button
                onClick={handleEmitirYImprimir}
                disabled={!puedeEmitir || !recetarioConfig || emitirRecetario.isPending}
                className="w-full"
                size="lg"
              >
                <Printer className="h-5 w-5 mr-2" />
                {emitirRecetario.isPending ? 'Emitiendo...' : 'Emitir y Imprimir Recetario'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
