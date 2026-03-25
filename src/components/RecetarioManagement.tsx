import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
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
  const [diagnostico, setDiagnostico] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [edad, setEdad] = useState('');
  const [nroSindical, setNroSindical] = useState('');
  const [generico1, setGenerico1] = useState('');
  const [generico2, setGenerico2] = useState('');
  const [dosisGenerico1, setDosisGenerico1] = useState('');
  const [dosisGenerico2, setDosisGenerico2] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);

  const { data: patients } = usePatients();
  const { data: recetariosDelMes } = useRecetariosDelMes(selectedPatientId);
  const { data: todosRecetarios } = useRecetarios();
  const emitirRecetario = useEmitirRecetario();
  const deleteRecetario = useDeleteRecetario();

  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  const recetariosUsados = recetariosDelMes?.length || 0;
  const puedeEmitir = recetariosUsados < LIMITE_RECETARIOS_MENSUAL;

  const tieneObraSocial = !!selectedPatient?.obra_social_id;

  const handleEmitirRecetario = async () => {
    if (!selectedPatient || !selectedPatient.obra_social_id) return;

    const result = await emitirRecetario.mutateAsync({
      paciente_id: selectedPatient.id,
      obra_social_id: selectedPatient.obra_social_id,
      tipo_recetario: 1,
      observaciones: observaciones || undefined,
    });

    return result;
  };

  const handleImprimirRecetario = (numeroRecetario?: number) => {
    if (!selectedPatient) return;

    generarRecetarioPDF({
      paciente: {
        nombre: selectedPatient.nombre || '',
        apellido: selectedPatient.apellido || '',
        dni: selectedPatient.dni || '',
        numero_afiliado: selectedPatient.numero_afiliado || undefined,
      },
      obraSocial: {
        nombre: selectedPatient.obra_social?.nombre || 'PARTICULAR',
      },
      tipoRecetario: 1,
      fecha: new Date().toISOString(),
      observaciones: observaciones || undefined,
      numeroRecetario,
      diagnostico,
      sintomas,
      edad,
      nroSindical,
      generico1,
      generico2,
      dosisGenerico1,
      dosisGenerico2,
    });
  };

  const handleEmitirYImprimir = async () => {
    if (tieneObraSocial) {
      const result = await handleEmitirRecetario();
      handleImprimirRecetario(result?.numero_recetario);
    } else {
      handleImprimirRecetario();
    }
  };

  const limpiarFormulario = () => {
    setObservaciones('');
    setDiagnostico('');
    setSintomas('');
    setEdad('');
    setNroSindical('');
    setGenerico1('');
    setGenerico2('');
    setDosisGenerico1('');
    setDosisGenerico2('');
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
                  <TableHead>N°</TableHead>
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
                    <TableCell className="font-mono font-bold">
                      {String(recetario.numero_recetario || 0).padStart(6, '0')}
                    </TableCell>
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
            Emite recetarios médicos para cualquier paciente
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
            Selecciona un paciente y completa los datos del recetario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de Paciente */}
          <div>
            <Label>Paciente</Label>
            <PatientSelector
              patients={patients || []}
              selectedPatientId={selectedPatientId || undefined}
              onSelect={(id) => {
                setSelectedPatientId(id);
                limpiarFormulario();
              }}
            />
          </div>

          {selectedPatient && (
            <>
              {/* Información del Paciente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                  <p className="text-lg font-semibold">
                    {selectedPatient.apellido}, {selectedPatient.nombre}
                  </p>
                  <p className="text-sm text-muted-foreground">DNI: {selectedPatient.dni}</p>
                  {selectedPatient.numero_afiliado && (
                    <p className="text-sm text-muted-foreground">N° Afiliado: {selectedPatient.numero_afiliado}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Obra Social</p>
                  <p className="text-lg font-semibold">
                    {selectedPatient.obra_social?.nombre || 'PARTICULAR'}
                  </p>
                </div>
              </div>

              {/* Contador de Recetarios del Mes (solo si tiene obra social) */}
              {tieneObraSocial && (
                <Card className={puedeEmitir ? 'border-green-500' : 'border-red-500'}>
                  <CardContent className="pt-6">
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
                  </CardContent>
                </Card>
              )}

              {!puedeEmitir && tieneObraSocial && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Límite mensual alcanzado. Este paciente ya utilizó los {LIMITE_RECETARIOS_MENSUAL} recetarios permitidos para este mes.
                  </AlertDescription>
                </Alert>
              )}

              {/* ─── FORMULARIO DEL RECETARIO ─── */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos del Recetario</CardTitle>
                  <CardDescription>
                    Complete los datos que se incluirán en el recetario impreso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="diagnostico">Diagnóstico</Label>
                      <Input
                        id="diagnostico"
                        placeholder="Ingrese el diagnóstico"
                        value={diagnostico}
                        onChange={(e) => setDiagnostico(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edad">Edad</Label>
                      <Input
                        id="edad"
                        placeholder="Ej: 45 años"
                        value={edad}
                        onChange={(e) => setEdad(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nroSindical">N° Sindical</Label>
                      <Input
                        id="nroSindical"
                        placeholder="Número sindical"
                        value={nroSindical}
                        onChange={(e) => setNroSindical(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sintomas">Síntomas y/o Signos Principales</Label>
                      <Input
                        id="sintomas"
                        placeholder="Ingrese los síntomas"
                        value={sintomas}
                        onChange={(e) => setSintomas(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Medicamentos */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Medicamentos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="generico1">Genérico Rp/1</Label>
                        <Input
                          id="generico1"
                          placeholder="Nombre del medicamento"
                          value={generico1}
                          onChange={(e) => setGenerico1(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dosisGenerico1">Dosis Diaria Genérico 1</Label>
                        <Input
                          id="dosisGenerico1"
                          placeholder="Ej: 1 comp. cada 8 hs"
                          value={dosisGenerico1}
                          onChange={(e) => setDosisGenerico1(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label htmlFor="generico2">Genérico Rp/2</Label>
                        <Input
                          id="generico2"
                          placeholder="Nombre del medicamento"
                          value={generico2}
                          onChange={(e) => setGenerico2(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dosisGenerico2">Dosis Diaria Genérico 2</Label>
                        <Input
                          id="dosisGenerico2"
                          placeholder="Ej: 1 comp. cada 12 hs"
                          value={dosisGenerico2}
                          onChange={(e) => setDosisGenerico2(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                    <Textarea
                      id="observaciones"
                      placeholder="Ingrese observaciones sobre este recetario..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleImprimirRecetario()}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Solo Imprimir
                </Button>
                <Button
                  onClick={handleEmitirYImprimir}
                  disabled={tieneObraSocial && (!puedeEmitir || emitirRecetario.isPending)}
                  className="flex-1"
                  size="lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  {emitirRecetario.isPending ? 'Emitiendo...' : tieneObraSocial ? 'Emitir y Imprimir' : 'Imprimir Recetario'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
