
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useNomecladorCrud, useDeleteNomeclador } from '@/hooks/useNomecladorCrud';
import { Nomenclador } from '@/hooks/useNomeclador';
import NomecladorForm from './NomecladorForm';

const NomecladorManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingNomeclador, setEditingNomeclador] = useState<Nomenclador | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: nomencladores, isLoading } = useNomecladorCrud();
  const { mutate: deleteNomeclador } = useDeleteNomeclador();

  const handleEdit = (nomenclador: Nomenclador) => {
    setEditingNomeclador(nomenclador);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este nomenclador?')) {
      deleteNomeclador(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNomeclador(null);
  };

  const filteredNomencladores = nomencladores?.filter(nomenclador => 
    nomenclador.codigo_practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nomenclador.descripcion_practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nomenclador.modulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando nomencladores...</div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <NomecladorForm
        nomenclador={editingNomeclador}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Nomenclador</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Nomenclador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Nomencladores</CardTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por código, descripción o módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Valor Unidades</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNomencladores?.map((nomenclador) => (
                <TableRow key={nomenclador.id}>
                  <TableCell className="font-medium">{nomenclador.codigo_practica}</TableCell>
                  <TableCell>{nomenclador.descripcion_practica}</TableCell>
                  <TableCell>{nomenclador.modulo}</TableCell>
                  <TableCell>{nomenclador.valor_resultante_unidades || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(nomenclador)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(nomenclador.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NomecladorManagement;
