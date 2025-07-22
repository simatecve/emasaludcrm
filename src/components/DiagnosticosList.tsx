
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, User, FileText } from 'lucide-react';
import { useDiagnosticos, useDeleteDiagnostico, Diagnostico } from '@/hooks/useDiagnosticos';
import DiagnosticoForm from './DiagnosticoForm';

interface DiagnosticosListProps {
  pacienteId: number;
  pacienteNombre: string;
}

const DiagnosticosList: React.FC<DiagnosticosListProps> = ({ pacienteId, pacienteNombre }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDiagnostico, setEditingDiagnostico] = useState<Diagnostico | undefined>();

  const { data: diagnosticos, isLoading } = useDiagnosticos(pacienteId);
  const deleteDiagnostico = useDeleteDiagnostico();

  const handleEdit = (diagnostico: Diagnostico) => {
    setEditingDiagnostico(diagnostico);
    setShowForm(true);
  };

  const handleDelete = (diagnostico: Diagnostico) => {
    if (confirm('¿Está seguro que desea eliminar este diagnóstico?')) {
      deleteDiagnostico.mutate(diagnostico.id);
    }
  };

  const handleNewDiagnostico = () => {
    setEditingDiagnostico(undefined);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDiagnostico(undefined);
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activo: 'bg-blue-100 text-blue-800',
      en_tratamiento: 'bg-yellow-100 text-yellow-800',
      resuelto: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      activo: 'Activo',
      en_tratamiento: 'En Tratamiento',
      resuelto: 'Resuelto'
    };

    return (
      <Badge className={variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[estado as keyof typeof labels] || estado}
      </Badge>
    );
  };

  if (showForm) {
    return (
      <DiagnosticoForm
        diagnostico={editingDiagnostico}
        pacienteId={pacienteId}
        onSubmit={() => handleCloseForm()}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Diagnósticos - {pacienteNombre}</h3>
          <p className="text-gray-600 text-sm">Historia médica y diagnósticos del paciente</p>
        </div>
        <Button onClick={handleNewDiagnostico} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Diagnóstico
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Cargando diagnósticos...</div>
      ) : diagnosticos && diagnosticos.length > 0 ? (
        <div className="space-y-4">
          {diagnosticos.map((diagnostico) => (
            <Card key={diagnostico.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(diagnostico.fecha_diagnostico).toLocaleDateString('es-AR')}
                    </span>
                    {getEstadoBadge(diagnostico.estado)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(diagnostico)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(diagnostico)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Diagnóstico</h4>
                  <p className="text-gray-700">{diagnostico.diagnostico}</p>
                </div>

                {diagnostico.tratamiento && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tratamiento</h4>
                    <p className="text-gray-700">{diagnostico.tratamiento}</p>
                  </div>
                )}

                {diagnostico.medico_tratante && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Médico: {diagnostico.medico_tratante}</span>
                  </div>
                )}

                {diagnostico.observaciones && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Observaciones
                    </h4>
                    <p className="text-gray-700 text-sm">{diagnostico.observaciones}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay diagnósticos registrados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiagnosticosList;
