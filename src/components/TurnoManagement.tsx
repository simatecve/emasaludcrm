
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTurnos, useDeleteTurno, type Turno } from '@/hooks/useTurnos';
import TurnoForm from './TurnoForm';
import { Plus, Search, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const TurnoManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | undefined>();

  const { data: turnos, isLoading } = useTurnos();
  const deleteMutation = useDeleteTurno();

  const filteredTurnos = turnos?.filter(turno =>
    turno.pacientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turno.pacientes?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turno.pacientes?.dni.includes(searchTerm) ||
    turno.medicos?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turno.medicos?.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const getEstadoBadge = (estado: string) => {
    const variants = {
      programado: 'default',
      confirmado: 'secondary',
      cancelado: 'destructive',
      completado: 'outline'
    } as const;

    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'default'}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="p-6">Cargando turnos...</div>;
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

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por paciente, médico o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTurnos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No se encontraron turnos
            </CardContent>
          </Card>
        ) : (
          filteredTurnos.map((turno) => (
            <Card key={turno.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {turno.pacientes?.nombre} {turno.pacientes?.apellido}
                      </h3>
                      <p className="text-sm text-gray-600">DNI: {turno.pacientes?.dni}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Dr. {turno.medicos?.nombre} {turno.medicos?.apellido}</p>
                      <p className="text-sm text-gray-600">Mat: {turno.medicos?.matricula}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(turno.fecha).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 text-gray-400 ml-2" />
                      <span>{turno.hora}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getEstadoBadge(turno.estado)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(turno)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar turno?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el turno.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(turno.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {turno.motivo && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm"><strong>Motivo:</strong> {turno.motivo}</p>
                  </div>
                )}
                
                {turno.observaciones && (
                  <div className="mt-2">
                    <p className="text-sm"><strong>Observaciones:</strong> {turno.observaciones}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TurnoManagement;
