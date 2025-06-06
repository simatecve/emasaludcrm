
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTurnos, useDeleteTurno, type Turno } from '@/hooks/useTurnos';
import TurnoForm from './TurnoForm';
import TurnoList from './turnos/TurnoList';
import { Plus } from 'lucide-react';

const TurnoManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | undefined>();

  const { data: turnos, isLoading, error } = useTurnos();
  const deleteMutation = useDeleteTurno();

  console.log('TurnoManagement render:', { turnos, isLoading, error });

  if (error) {
    console.error('Error in TurnoManagement:', error);
  }

  const handleEdit = (turno: Turno) => {
    setEditingTurno(turno);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTurno(undefined);
  };

  if (isLoading) {
    return <div className="p-6">Cargando turnos...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error cargando turnos: {error.message}</div>
        <div className="mt-2 text-sm text-gray-500">Ver consola para más detalles</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTurno(undefined)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Turno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingTurno ? 'Editar Turno' : 'Nuevo Turno'}
              </DialogTitle>
            </DialogHeader>
            <TurnoForm turno={editingTurno} onClose={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Debug info */}
      <div className="bg-gray-100 p-4 rounded text-sm">
        <strong>Debug:</strong> {turnos?.length || 0} turnos encontrados
      </div>

      {/* Lista de turnos */}
      <TurnoList
        turnos={turnos || []}
        totalTurnos={turnos?.length || 0}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default TurnoManagement;
