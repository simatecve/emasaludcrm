
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTurnos, useDeleteTurno, type Turno } from '@/hooks/useTurnos';
import TurnoForm from './TurnoForm';
import TurnoCalendarView from './turnos/TurnoCalendarView';

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

  const handleNewTurno = () => {
    setEditingTurno(undefined);
    setIsDialogOpen(true);
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
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
          <p className="text-gray-600">Programa y administra las citas médicas</p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingTurno ? 'Editar Turno' : 'Nuevo Turno'}
            </DialogTitle>
          </DialogHeader>
          <TurnoForm turno={editingTurno} onClose={handleCloseDialog} />
        </DialogContent>
      </Dialog>

      <TurnoCalendarView
        turnos={turnos || []}
        onEdit={handleEdit}
        onNewTurno={handleNewTurno}
      />
    </div>
  );
};

export default TurnoManagement;
