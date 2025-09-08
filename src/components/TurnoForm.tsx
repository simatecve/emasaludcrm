
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateTurno, useUpdateTurno, type Turno, type TurnoFormData } from '@/hooks/useTurnos';
import { usePatients } from '@/hooks/usePatients';
import { useMedicos } from '@/hooks/useMedicos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface TurnoFormProps {
  turno?: Turno;
  onClose: () => void;
}

const TurnoForm = ({ turno, onClose }: TurnoFormProps) => {
  const [formData, setFormData] = useState<TurnoFormData>({
    paciente_id: turno?.paciente_id || undefined,
    medico_id: turno?.medico_id || undefined,
    fecha: turno?.fecha || '',
    hora: turno?.hora || '',
    estado: turno?.estado || 'programado',
    motivo: turno?.motivo || '',
    observaciones: turno?.observaciones || '',
  });

  const { data: pacientes, isLoading: loadingPacientes } = usePatients();
  const { data: medicos, isLoading: loadingMedicos } = useMedicos();

  const createMutation = useCreateTurno();
  const updateMutation = useUpdateTurno();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paciente_id || !formData.medico_id || !formData.fecha || !formData.hora) {
      return;
    }

    if (turno) {
      await updateMutation.mutateAsync({ id: turno.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {turno ? 'Editar Turno' : 'Nuevo Turno'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paciente_id">Paciente *</Label>
              <Select
                value={formData.paciente_id ? formData.paciente_id.toString() : ""}
                onValueChange={(value) => setFormData({ ...formData, paciente_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPacientes ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    pacientes?.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id.toString()}>
                        {paciente.nombre} {paciente.apellido} - {paciente.dni}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medico_id">Médico *</Label>
              <Select
                value={formData.medico_id ? formData.medico_id.toString() : ""}
                onValueChange={(value) => setFormData({ ...formData, medico_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar médico" />
                </SelectTrigger>
                <SelectContent>
                  {loadingMedicos ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    medicos?.map((medico) => (
                      <SelectItem key={medico.id} value={medico.id.toString()}>
                        {medico.nombre} {medico.apellido} - {medico.matricula}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora *</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo de la consulta</Label>
            <Textarea
              id="motivo"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="Motivo de la consulta"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Observaciones adicionales"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.paciente_id || !formData.medico_id || !formData.fecha || !formData.hora}
            >
              {isLoading ? 'Guardando...' : turno ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TurnoForm;
