
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useObrasSociales, useDeleteObraSocial } from '@/hooks/useObrasSociales';
import ObraSocialForm from './ObraSocialForm';

const ObraSocialManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingObraSocial, setEditingObraSocial] = useState(null);
  const { data: obrasSociales, isLoading } = useObrasSociales();
  const { mutate: deleteObraSocial } = useDeleteObraSocial();

  const handleEdit = (obraSocial) => {
    setEditingObraSocial(obraSocial);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta obra social?')) {
      deleteObraSocial(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingObraSocial(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando obras sociales...</div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ObraSocialForm
        obraSocial={editingObraSocial}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Obras Sociales</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Obra Social
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Obras Sociales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obrasSociales?.map((obraSocial) => (
                <TableRow key={obraSocial.id}>
                  <TableCell className="font-medium">{obraSocial.nombre}</TableCell>
                  <TableCell>{obraSocial.codigo || '-'}</TableCell>
                  <TableCell>{obraSocial.telefono || '-'}</TableCell>
                  <TableCell>{obraSocial.email || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      obraSocial.activa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {obraSocial.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(obraSocial)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(obraSocial.id)}
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

export default ObraSocialManagement;
