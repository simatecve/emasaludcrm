
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutorizaciones, useDeleteAutorizacion, useCreateAutorizacion, useUpdateAutorizacion, type Autorizacion } from '@/hooks/useAutorizaciones';
import { Plus, Edit, Trash2, FileText, Filter, Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AutorizacionForm from './AutorizacionForm';
import AutorizacionPDF from './AutorizacionPDF';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AutorizacionManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAutorizacion, setSelectedAutorizacion] = useState<Autorizacion | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');

  const { data: autorizaciones, isLoading } = useAutorizaciones();
  const deleteMutation = useDeleteAutorizacion();
  const createMutation = useCreateAutorizacion();
  const updateMutation = useUpdateAutorizacion();

  const openForm = (autorizacion?: Autorizacion) => {
    setSelectedAutorizacion(autorizacion);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedAutorizacion(undefined);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedAutorizacion) {
        await updateMutation.mutateAsync({
          id: selectedAutorizacion.id,
          data
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeForm();
    } catch (error) {
      console.error('Error saving authorization:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta autorización?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      pendiente: 'default',
      aprobada: 'default',
      rechazada: 'destructive',
      vencida: 'secondary'
    } as const;

    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
      vencida: 'bg-gray-100 text-gray-800'
    } as const;

    return (
      <Badge variant={variants[estado as keyof typeof variants]} className={colors[estado as keyof typeof colors]}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const filteredAutorizaciones = autorizaciones?.filter(autorizacion => {
    const matchesSearch = 
      autorizacion.numero_autorizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${autorizacion.pacientes?.nombre} ${autorizacion.pacientes?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      autorizacion.tipo_autorizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      autorizacion.prestacion_codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      autorizacion.prestacion_descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'todos' || autorizacion.estado === filterEstado;
    const matchesTipo = filterTipo === 'todos' || autorizacion.tipo_autorizacion === filterTipo;

    return matchesSearch && matchesEstado && matchesTipo;
  });

  const tiposUnicos = [...new Set(autorizaciones?.map(a => a.tipo_autorizacion))];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Autorizaciones</h1>
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Autorización
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por paciente, número o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="aprobada">Aprobadas</SelectItem>
                <SelectItem value="rechazada">Rechazadas</SelectItem>
                <SelectItem value="vencida">Vencidas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tiposUnicos.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterEstado('todos');
                setFilterTipo('todos');
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Autorizaciones */}
      <div className="grid gap-4">
        {filteredAutorizaciones?.map((autorizacion) => (
          <Card key={autorizacion.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">
                      {autorizacion.numero_autorizacion || `AUT-${autorizacion.id}`}
                    </h3>
                    {getEstadoBadge(autorizacion.estado)}
                    <Badge variant="outline">
                      {autorizacion.tipo_autorizacion}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Paciente:</span>{' '}
                      {autorizacion.pacientes?.nombre} {autorizacion.pacientes?.apellido}
                      <br />
                      <span className="font-medium">DNI:</span> {autorizacion.pacientes?.dni}
                      {autorizacion.numero_credencial && (
                        <>
                          <br />
                          <span className="font-medium">Credencial:</span> {autorizacion.numero_credencial}
                        </>
                      )}
                    </div>
                    
                    <div>
                      {autorizacion.medicos && (
                        <>
                          <span className="font-medium">Médico:</span>{' '}
                          {autorizacion.medicos.nombre} {autorizacion.medicos.apellido}
                          <br />
                          <span className="font-medium">Matrícula:</span> {autorizacion.medicos.matricula}
                          <br />
                        </>
                      )}
                      {autorizacion.obras_sociales && (
                        <>
                          <span className="font-medium">Obra Social:</span>{' '}
                          {autorizacion.obras_sociales.nombre}
                        </>
                      )}
                    </div>
                    
                    <div>
                      {autorizacion.prestacion_codigo && (
                        <>
                          <span className="font-medium">Prestación:</span>{' '}
                          {autorizacion.prestacion_codigo}
                          <br />
                        </>
                      )}
                      {autorizacion.fecha_vencimiento && (
                        <>
                          <span className="font-medium">Vence:</span>{' '}
                          {format(new Date(autorizacion.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}
                          <br />
                        </>
                      )}
                      {autorizacion.documento_url && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <FileText className="h-3 w-3" />
                          <span className="text-xs">Documento adjunto</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(autorizacion.prestacion_descripcion || autorizacion.descripcion) && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Descripción:</span>{' '}
                      {autorizacion.prestacion_descripcion || autorizacion.descripcion}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <AutorizacionPDF autorizacion={autorizacion} />
                  {autorizacion.documento_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(autorizacion.documento_url, '_blank')}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openForm(autorizacion)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(autorizacion.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAutorizaciones?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No se encontraron autorizaciones que coincidan con los filtros.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para formulario */}
      <Dialog open={isFormOpen} onOpenChange={closeForm}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <AutorizacionForm
            autorizacion={selectedAutorizacion}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutorizacionManagement;
