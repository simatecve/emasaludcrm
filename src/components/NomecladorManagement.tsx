
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

  const { data: nomencladores, isLoading } = useNomecladorCrud();
  const deleteMutation = useDeleteNomeclador();

  const openForm = (nomenclador?: Nomenclador) => {
    setSelectedNomeclador(nomenclador);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedNomeclador(undefined);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro del nomenclador?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const filteredNomencladores = nomencladores?.filter(nomenclador => 
    nomenclador.codigo_practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nomenclador.descripcion_practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nomenclador.modulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Nomenclador</h1>
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por código, descripción o módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Valor (Unidades)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNomencladores?.map((nomenclador) => (
                <TableRow key={nomenclador.id}>
                  <TableCell className="font-medium">{nomenclador.codigo_practica}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={nomenclador.descripcion_practica}>
                      {nomenclador.descripcion_practica}
                    </div>
                  </TableCell>
                  <TableCell>{nomenclador.modulo}</TableCell>
                  <TableCell>{nomenclador.valor_resultante_unidades || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredNomencladores?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron registros que coincidan con la búsqueda.' : 'No hay registros en el nomenclador.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para formulario */}
      <Dialog open={isFormOpen} onOpenChange={closeForm}>
        <DialogContent className="max-w-4xl">
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
