
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTurnos, useDeleteTurno, type Turno } from '@/hooks/useTurnos';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import TurnoForm from './TurnoForm';
import { Plus, Search, Edit, Trash2, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TurnoManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');

  const { data: turnos, isLoading, error } = useTurnos();
  const { data: especialidades, isLoading: loadingEspecialidades } = useEspecialidades();
  const deleteMutation = useDeleteTurno();

  console.log('TurnoManagement render:', { turnos, isLoading, error });

  // Debug info
  if (error) {
    console.error('Error in TurnoManagement:', error);
  }

  const filteredTurnos = turnos?.filter(turno => {
    const matchesSearch = turno.pacientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turno.pacientes?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turno.pacientes?.dni.includes(searchTerm) ||
      turno.medicos?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turno.medicos?.apellido.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !selectedDate || 
      new Date(turno.fecha).toDateString() === selectedDate.toDateString();

    const matchesEspecialidad = !selectedEspecialidad || 
      turno.medicos?.especialidad?.nombre === selectedEspecialidad;

    const matchesEstado = !selectedEstado || turno.estado === selectedEstado;

    return matchesSearch && matchesDate && matchesEspecialidad && matchesEstado;
  }) || [];

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

  const clearFilters = () => {
    setSelectedDate(undefined);
    setSelectedEspecialidad('');
    setSelectedEstado('');
    setSearchTerm('');
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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar paciente, médico o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Calendario */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Filtro de Especialidad */}
            <Select value={selectedEspecialidad} onValueChange={setSelectedEspecialidad}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las especialidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las especialidades</SelectItem>
                {loadingEspecialidades ? (
                  <SelectItem value="loading" disabled>Cargando...</SelectItem>
                ) : (
                  especialidades?.map((especialidad) => (
                    <SelectItem key={especialidad.id} value={especialidad.nombre}>
                      {especialidad.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Filtro de Estado */}
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="programado">Programado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>

            {/* Limpiar filtros */}
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de turnos */}
      <div className="grid gap-4">
        {filteredTurnos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              {turnos?.length === 0 ? 'No hay turnos registrados' : 'No se encontraron turnos con los filtros aplicados'}
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
                        {turno.pacientes?.nombre || 'N/A'} {turno.pacientes?.apellido || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600">DNI: {turno.pacientes?.dni || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Dr. {turno.medicos?.nombre || 'N/A'} {turno.medicos?.apellido || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Mat: {turno.medicos?.matricula || 'N/A'}</p>
                      {turno.medicos?.especialidad && (
                        <p className="text-sm text-blue-600">{turno.medicos.especialidad.nombre}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
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
