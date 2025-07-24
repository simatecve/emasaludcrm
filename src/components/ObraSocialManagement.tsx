
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useObrasSociales, useDeleteObraSocial, useUpdateObraSocial } from '@/hooks/useObrasSociales';
import ObraSocialForm from './ObraSocialForm';

const ObraSocialManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingObraSocial, setEditingObraSocial] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const { data: obrasSociales, isLoading } = useObrasSociales();
  const { mutate: deleteObraSocial } = useDeleteObraSocial();
  const { mutate: updateObraSocial } = useUpdateObraSocial();

  const handleEdit = (obraSocial) => {
    setEditingObraSocial(obraSocial);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar definitivamente esta obra social?')) {
      deleteObraSocial(id);
    }
  };

  const handleToggleActive = (obraSocial) => {
    const action = obraSocial.activa ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro que desea ${action} esta obra social?`)) {
      updateObraSocial({ 
        id: obraSocial.id, 
        data: { activa: !obraSocial.activa } 
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingObraSocial(null);
  };

  // Filtrar obras sociales según el estado que se quiere mostrar
  const filteredObrasSociales = obrasSociales?.filter(obraSocial => 
    showInactive ? !obraSocial.activa : obraSocial.activa
  );

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
        <div className="flex items-center gap-4">
          <Button
            variant={showInactive ? "default" : "outline"}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? 'Ver Activas' : 'Ver Inactivas'}
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Obra Social
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {showInactive ? 'Obras Sociales Inactivas' : 'Obras Sociales Activas'}
          </CardTitle>
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
              {filteredObrasSociales?.map((obraSocial) => (
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
                        disabled={!obraSocial.activa}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(obraSocial)}
                        className={obraSocial.activa ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {obraSocial.activa ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      {!obraSocial.activa && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(obraSocial.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ObraSocialManagement;
