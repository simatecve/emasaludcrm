
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMedicos, useDeleteMedico } from '@/hooks/useMedicos';
import MedicoForm from './MedicoForm';

const MedicoManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMedico, setEditingMedico] = useState(null);
  const { data: medicos, isLoading } = useMedicos();
  const { mutate: deleteMedico } = useDeleteMedico();

  const handleEdit = (medico) => {
    setEditingMedico(medico);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este médico?')) {
      deleteMedico(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMedico(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando médicos...</div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <MedicoForm
        medico={editingMedico}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Médicos</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Médico
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Médicos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicos?.map((medico) => (
                <TableRow key={medico.id}>
                  <TableCell className="font-medium">
                    {medico.nombre} {medico.apellido}
                  </TableCell>
                  <TableCell>{medico.dni}</TableCell>
                  <TableCell>{medico.matricula}</TableCell>
                  <TableCell>{medico.especialidades?.nombre || '-'}</TableCell>
                  <TableCell>{medico.telefono || '-'}</TableCell>
                  <TableCell>{medico.email || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(medico)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(medico.id)}
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

export default MedicoManagement;
