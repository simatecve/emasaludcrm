
import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Upload, AlertTriangle } from 'lucide-react';
import { useNomecladorCrud, useDeleteNomeclador, useDeleteAllNomeclador, useBulkCreateNomeclador } from '@/hooks/useNomecladorCrud';
import { Nomenclador } from '@/hooks/useNomeclador';
import NomecladorForm from './NomecladorForm';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const NomecladorManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNomeclador, setSelectedNomeclador] = useState<Nomenclador | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: nomencladores, isLoading, error } = useNomecladorCrud();
  const deleteMutation = useDeleteNomeclador();
  const deleteAllMutation = useDeleteAllNomeclador();
  const bulkCreateMutation = useBulkCreateNomeclador();

  const filteredNomencladores = useMemo(() => {
    if (!nomencladores) return [];
    if (!searchTerm.trim()) return nomencladores;
    return nomencladores.filter(nom =>
      nom.codigo_practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.descripcion_practica.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDeleteAll = () => {
    if (deleteConfirmText === 'ELIMINAR') {
      deleteAllMutation.mutate(undefined, {
        onSuccess: () => {
          setShowDeleteAllDialog(false);
          setDeleteConfirmText('');
        }
      });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const items = results.data.map((row: any) => ({
            codigo_practica: String(row.codigo_practica || row.codigo || row.Codigo || row.CODIGO || '').trim(),
            descripcion_practica: String(row.descripcion_practica || row.descripcion || row.Descripcion || row.DESCRIPCION || '').trim(),
            valor_resultante_unidades: String(row.valor_resultante_unidades || row.valor || row.Valor || row.VALOR || '').trim() || undefined,
          })).filter(item => item.codigo_practica && item.descripcion_practica);
          if (items.length > 0) bulkCreateMutation.mutate(items);
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const items = data.map((row: any) => ({
          codigo_practica: String(row.codigo_practica || row.codigo || row.Codigo || row.CODIGO || Object.values(row)[0] || '').trim(),
          descripcion_practica: String(row.descripcion_practica || row.descripcion || row.Descripcion || row.DESCRIPCION || Object.values(row)[1] || '').trim(),
          valor_resultante_unidades: String(row.valor_resultante_unidades || row.valor || row.Valor || row.VALOR || Object.values(row)[2] || '').trim() || undefined,
        })).filter((item: any) => item.codigo_practica && item.descripcion_practica);
        if (items.length > 0) bulkCreateMutation.mutate(items);
      };
      reader.readAsBinaryString(file);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Error al cargar el nomenclador: {error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nomenclador</h1>
          <p className="text-muted-foreground">Gestión del nomenclador de prácticas médicas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAllDialog(true)}
            disabled={!nomencladores || nomencladores.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Todo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileImport}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={bulkCreateMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {bulkCreateMutation.isPending ? 'Importando...' : 'Importar Excel/CSV'}
          </Button>
          <Button onClick={() => openForm()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Práctica
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
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
                    <TableHead>Valor/Unidades</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNomencladores.map((nomenclador) => (
                    <TableRow key={nomenclador.id}>
                      <TableCell className="font-mono text-sm">{nomenclador.codigo_practica}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={nomenclador.descripcion_practica}>
                          {nomenclador.descripcion_practica}
                        </div>
                      </TableCell>
                      <TableCell>{nomenclador.valor_resultante_unidades || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => openForm(nomenclador)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(nomenclador.id)}>
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
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay registros en el nomenclador'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Eliminar Todo el Nomenclador
            </DialogTitle>
            <DialogDescription>
              Esta acción eliminará <strong>todos los {nomencladores?.length || 0} registros</strong> del nomenclador.
              Esta acción NO se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Escriba <strong>ELIMINAR</strong> para confirmar:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Escriba ELIMINAR"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteAllDialog(false); setDeleteConfirmText(''); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== 'ELIMINAR' || deleteAllMutation.isPending}
              onClick={handleDeleteAll}
            >
              {deleteAllMutation.isPending ? 'Eliminando...' : 'Confirmar Eliminación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <NomecladorForm nomenclador={selectedNomeclador} onClose={closeForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NomecladorManagement;
