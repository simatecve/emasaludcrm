
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useNomecladorCrud, useDeleteNomeclador } from '@/hooks/useNomecladorCrud';
import { Nomenclador } from '@/hooks/useNomeclador';
import NomecladorForm from './NomecladorForm';

const NomecladorManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNomeclador, setSelectedNomeclador] = useState<Nomenclador | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: nomencladores, isLoading, error } = useNomecladorCrud();
  const deleteMutation = useDeleteNomeclador();

  // Filtrar nomencladores según el término de búsqueda
  const filteredNomencladores = useMemo(() => {
    if (!nomencladores) return [];
    if (!searchTerm.trim()) return nomencladores;

    return nomencladores.filter(nom =>
      nom.codigo_practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.descripcion_practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.modulo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nomencladores, searchTerm]);

  const openForm = (nomenclador?: Nomenclador) => {
    setSelectedNomeclador(nomenclador);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedNomeclador(undefined);
    setIsFormOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro que desea eliminar este registro del nomenclador?')) {
      deleteMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar el nomenclador: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nomenclador</h1>
          <p className="text-gray-600">Gestión del nomenclador de prácticas médicas</p>
        </div>
        <Button onClick={() => openForm()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Práctica
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por código, descripción o módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredNomencladores.length} de {nomencladores?.length || 0} registros
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando nomenclador...</div>
          ) : filteredNomencladores.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Valor/Unidades</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNomencladores.map((nomenclador) => (
                    <TableRow key={nomenclador.id}>
                      <TableCell className="font-mono text-sm">
                        {nomenclador.codigo_practica}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={nomenclador.descripcion_practica}>
                          {nomenclador.descripcion_practica}
                        </div>
                      </TableCell>
                      <TableCell>{nomenclador.modulo}</TableCell>
                      <TableCell>
                        {nomenclador.valor_resultante_unidades || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openForm(nomenclador)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(nomenclador.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay registros en el nomenclador'}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <NomecladorForm
            nomenclador={selectedNomeclador}
            onClose={closeForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NomecladorManagement;
