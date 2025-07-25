import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Download, Shield } from 'lucide-react';
import { useAutorizaciones, useDeleteAutorizacion, useCreateAutorizacion, useUpdateAutorizacion } from '@/hooks/useAutorizaciones';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AutorizacionForm from './AutorizacionForm';
import PrestadorAutorizacionForm from './PrestadorAutorizacionForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AutorizacionManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAutorizacion, setSelectedAutorizacion] = useState<any>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: autorizaciones, isLoading, error } = useAutorizaciones();
  const { data: currentUser } = useCurrentUser();
  const deleteAutorizacion = useDeleteAutorizacion();
  const createAutorizacion = useCreateAutorizacion();
  const updateAutorizacion = useUpdateAutorizacion();
  const { toast } = useToast();

  const openForm = (autorizacion?: any) => {
    setSelectedAutorizacion(autorizacion);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedAutorizacion(undefined);
    setIsFormOpen(false);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedAutorizacion) {
        await updateAutorizacion.mutateAsync({
          id: selectedAutorizacion.id,
          data
        });
        toast({
          title: "Éxito",
          description: "Autorización actualizada correctamente",
        });
      } else {
        await createAutorizacion.mutateAsync(data);
        toast({
          title: "Éxito",
          description: "Autorización creada correctamente",
        });
      }
      closeForm();
    } catch (error) {
      console.error('Error saving authorization:', error);
      toast({
        title: "Error",
        description: "Error al guardar la autorización",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (currentUser?.role === 'usuario_normal' || currentUser?.role === 'prestador') {
      toast({
        title: "Sin permisos",
        description: "No tiene permisos para eliminar registros",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('¿Está seguro que desea eliminar esta autorización?')) {
      try {
        await deleteAutorizacion.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting authorization:', error);
      }
    }
  };

  const filteredAutorizaciones = autorizaciones?.filter(autorizacion =>
    autorizacion.pacientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    autorizacion.pacientes?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    autorizacion.pacientes?.dni.includes(searchTerm) ||
    autorizacion.tipo_autorizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    autorizacion.numero_autorizacion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return 'default';
      case 'pendiente':
        return 'secondary';
      case 'rechazada':
        return 'destructive';
      case 'vencida':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return 'Aprobada';
      case 'pendiente':
        return 'Pendiente';
      case 'rechazada':
        return 'Rechazada';
      case 'vencida':
        return 'Vencida';
      default:
        return estado;
    }
  };

  // Verificar permisos para prestadores
  if (currentUser?.role === 'prestador') {
    // Los prestadores pueden crear una sola solicitud
    const userAutorizaciones = autorizaciones?.filter(auth => auth.prestador === currentUser.full_name);
    const canCreateNew = !userAutorizaciones || userAutorizaciones.length === 0;

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Solicitudes de Autorización</h1>
            <p className="text-gray-600">Gestionar solicitudes de autorización como prestador</p>
          </div>
          {canCreateNew && (
            <Button onClick={() => openForm()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Solicitud
            </Button>
          )}
        </div>

        {!canCreateNew && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Ya tiene una solicitud de autorización activa. Los prestadores pueden realizar una sola solicitud.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Mis Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando autorizaciones...</div>
            ) : userAutorizaciones && userAutorizaciones.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Solicitud</TableHead>
                    <TableHead>Prestación</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAutorizaciones.map((autorizacion) => (
                    <TableRow key={autorizacion.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {autorizacion.pacientes?.nombre} {autorizacion.pacientes?.apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            DNI: {autorizacion.pacientes?.dni}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {autorizacion.tipo_autorizacion}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoColor(autorizacion.estado)}>
                          {getEstadoLabel(autorizacion.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {autorizacion.fecha_solicitud ? 
                          format(new Date(autorizacion.fecha_solicitud), 'dd/MM/yyyy', { locale: es }) : 
                          'No especificada'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {autorizacion.prestacion_codigo && (
                            <div>Código: {autorizacion.prestacion_codigo}</div>
                          )}
                          {autorizacion.prestacion_descripcion && (
                            <div className="text-gray-600">{autorizacion.prestacion_descripcion}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openForm(autorizacion)}
                            disabled={autorizacion.estado !== 'pendiente'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No tiene solicitudes de autorización
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <PrestadorAutorizacionForm onClose={closeForm} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Vista normal para admin y usuario_normal
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar autorizaciones: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Autorizaciones</h1>
          <p className="text-gray-600">Administrar autorizaciones médicas</p>
        </div>
        <Button onClick={() => openForm()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Autorización
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Autorizaciones Registradas</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar autorizaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando autorizaciones...</div>
          ) : filteredAutorizaciones && filteredAutorizaciones.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Solicitud</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Obra Social</TableHead>
                    <TableHead>Prestación</TableHead>
                    <TableHead className="w-[150px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAutorizaciones.map((autorizacion) => (
                    <TableRow key={autorizacion.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {autorizacion.pacientes?.nombre} {autorizacion.pacientes?.apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            DNI: {autorizacion.pacientes?.dni}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {autorizacion.tipo_autorizacion}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoColor(autorizacion.estado)}>
                          {getEstadoLabel(autorizacion.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {autorizacion.fecha_solicitud ? 
                          format(new Date(autorizacion.fecha_solicitud), 'dd/MM/yyyy', { locale: es }) : 
                          'No especificada'
                        }
                      </TableCell>
                      <TableCell>
                        {autorizacion.medicos ? 
                          `${autorizacion.medicos.nombre} ${autorizacion.medicos.apellido}` : 
                          'No asignado'
                        }
                      </TableCell>
                      <TableCell>
                        {autorizacion.obras_sociales?.nombre || 'No especificada'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {autorizacion.prestacion_codigo && (
                            <div>Código: {autorizacion.prestacion_codigo}</div>
                          )}
                          {autorizacion.prestacion_descripcion && (
                            <div className="text-gray-600">{autorizacion.prestacion_descripcion}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openForm(autorizacion)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {autorizacion.documento_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(autorizacion.documento_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {currentUser?.role === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(autorizacion.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron autorizaciones' : 'No hay autorizaciones registradas'}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AutorizacionForm
            autorizacion={selectedAutorizacion}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isLoading={createAutorizacion.isPending || updateAutorizacion.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutorizacionManagement;
