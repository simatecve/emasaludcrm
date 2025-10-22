
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutorizaciones, useUpdateAutorizacion, useDeleteAutorizacion, useCreateAutorizacion } from '@/hooks/useAutorizaciones';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AutorizacionForm from './AutorizacionForm';
import AutorizacionPDF from './AutorizacionPDF';
import { Plus, Edit, Trash2, Search, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const AutorizacionManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAutorizacion, setSelectedAutorizacion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: autorizaciones, isLoading, refetch } = useAutorizaciones();
  const { data: currentUser } = useCurrentUser();
  const updateAutorizacion = useUpdateAutorizacion();
  const deleteAutorizacion = useDeleteAutorizacion();
  const createAutorizacion = useCreateAutorizacion();
  const { toast } = useToast();

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'aprobada':
        return <Badge variant="default">Aprobada</Badge>;
      case 'rechazada':
        return <Badge variant="destructive">Rechazada</Badge>;
      case 'vencida':
        return <Badge variant="outline">Vencida</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const handleStatusChange = async (autorizacionId: number, newStatus: 'pendiente' | 'aprobada' | 'rechazada' | 'vencida') => {
    try {
      await updateAutorizacion.mutateAsync({ id: autorizacionId, data: { estado: newStatus } });
      toast({
        title: "Estado actualizado",
        description: "El estado de la autorización se ha actualizado exitosamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al actualizar el estado: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (autorizacionId: number) => {
    try {
      await deleteAutorizacion.mutateAsync(autorizacionId);
      toast({
        title: "Autorización eliminada",
        description: "La autorización se ha eliminado exitosamente.",
      });
      setSelectedIds(prev => prev.filter(id => id !== autorizacionId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al eliminar la autorización: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await Promise.all(selectedIds.map(id => deleteAutorizacion.mutateAsync(id)));
      toast({
        title: "Autorizaciones eliminadas",
        description: `Se eliminaron ${selectedIds.length} autorizaciones exitosamente.`,
      });
      setSelectedIds([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al eliminar las autorizaciones: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAutorizaciones.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAutorizaciones.map(a => a.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedAutorizacion) {
        await updateAutorizacion.mutateAsync({ id: selectedAutorizacion.id, data });
      } else {
        await createAutorizacion.mutateAsync(data);
      }
      setIsFormOpen(false);
      setSelectedAutorizacion(null);
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAutorizacion(null);
  };

  const filteredAutorizaciones = autorizaciones?.filter(autorizacion => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Safe string checking function
    const safeIncludes = (str: string | null | undefined, searchTerm: string): boolean => {
      return str ? str.toLowerCase().includes(searchTerm) : false;
    };
    
    const pacienteMatch = safeIncludes(autorizacion.pacientes?.nombre, searchLower) ||
                         safeIncludes(autorizacion.pacientes?.apellido, searchLower) ||
                         safeIncludes(autorizacion.pacientes?.dni, searchTerm);
    
    const numeroMatch = safeIncludes(autorizacion.numero_autorizacion, searchLower);
    const obraSocialMatch = safeIncludes(autorizacion.obras_sociales?.nombre, searchLower);
    
    // Buscar en prestaciones
    const prestacionMatch = autorizacion.prestaciones?.some(prestacion => 
      safeIncludes(prestacion.prestacion_codigo, searchLower) ||
      safeIncludes(prestacion.prestacion_descripcion, searchLower)
    ) || false;

    return pacienteMatch || numeroMatch || obraSocialMatch || prestacionMatch;
  }) || [];

  if (isLoading) {
    return <div>Cargando autorizaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Autorizaciones</h2>
        <div className="flex gap-2">
          {currentUser?.role === 'admin' && selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Seleccionados ({selectedIds.length})
            </Button>
          )}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Autorización
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAutorizacion ? 'Editar Autorización' : 'Nueva Autorización'}
              </DialogTitle>
            </DialogHeader>
            <AutorizacionForm
              autorizacion={selectedAutorizacion}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              isLoading={updateAutorizacion.isPending || createAutorizacion.isPending}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Autorizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por paciente, número de autorización, obra social o prestación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Autorizaciones Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {currentUser?.role === 'admin' && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredAutorizaciones.length && filteredAutorizaciones.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Paciente</TableHead>
                <TableHead>Obra Social</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prestaciones</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAutorizaciones.map((autorizacion) => (
                <TableRow key={autorizacion.id}>
                  {currentUser?.role === 'admin' && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(autorizacion.id)}
                        onCheckedChange={() => toggleSelect(autorizacion.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {autorizacion.pacientes?.nombre} {autorizacion.pacientes?.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        DNI: {autorizacion.pacientes?.dni}
                      </div>
                      {autorizacion.numero_autorizacion && (
                        <div className="text-sm text-blue-600">
                          #{autorizacion.numero_autorizacion}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {autorizacion.obras_sociales?.nombre || 'No especificada'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {autorizacion.tipo_autorizacion}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {autorizacion.prestaciones && autorizacion.prestaciones.length > 0 ? (
                        <div className="space-y-1">
                          {autorizacion.prestaciones.slice(0, 2).map((prestacion, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{prestacion.prestacion_codigo}</span>
                              {prestacion.prestacion_descripcion && (
                                <span className="text-gray-600 ml-1">
                                  - {prestacion.prestacion_descripcion.length > 30 
                                    ? `${prestacion.prestacion_descripcion.substring(0, 30)}...` 
                                    : prestacion.prestacion_descripcion}
                                </span>
                              )}
                              <span className="text-gray-500 ml-1">(x{prestacion.cantidad})</span>
                            </div>
                          ))}
                          {autorizacion.prestaciones.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{autorizacion.prestaciones.length - 2} más...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">Sin prestaciones</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {currentUser?.role === 'admin' ? (
                      <Select
                        value={autorizacion.estado}
                        onValueChange={(value: 'pendiente' | 'aprobada' | 'rechazada' | 'vencida') => handleStatusChange(autorizacion.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="aprobada">Aprobada</SelectItem>
                          <SelectItem value="rechazada">Rechazada</SelectItem>
                          <SelectItem value="vencida">Vencida</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(autorizacion.estado)
                    )}
                  </TableCell>
                  <TableCell>
                    {autorizacion.fecha_solicitud ? 
                      format(new Date(autorizacion.fecha_solicitud), 'dd/MM/yyyy', { locale: es }) : 
                      'No especificada'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(autorizacion.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <AutorizacionPDF autorizacion={autorizacion} />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAutorizacion(autorizacion);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAutorizaciones.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No se encontraron autorizaciones que coincidan con los criterios de búsqueda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutorizacionManagement;
