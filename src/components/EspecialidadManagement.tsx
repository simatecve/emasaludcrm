
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEspecialidades, useDeleteEspecialidad } from '@/hooks/useEspecialidades';
import EspecialidadForm from './EspecialidadForm';

const EspecialidadManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEspecialidad, setEditingEspecialidad] = useState(null);
  const { data: especialidades, isLoading } = useEspecialidades();
  const { mutate: deleteEspecialidad } = useDeleteEspecialidad();

  const handleEdit = (especialidad) => {
    setEditingEspecialidad(especialidad);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta especialidad?')) {
      deleteEspecialidad(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEspecialidad(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando especialidades...</div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <EspecialidadForm
        especialidad={editingEspecialidad}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Especialidades</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Especialidad
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Especialidades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {especialidades?.map((especialidad) => (
                <TableRow key={especialidad.id}>
                  <TableCell className="font-medium">{especialidad.nombre}</TableCell>
                  <TableCell>{especialidad.descripcion || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      especialidad.activa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {especialidad.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(especialidad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(especialidad.id)}
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

export default EspecialidadManagement;
