import React, { useState, useMemo } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { usePatients } from '@/hooks/usePatients';
import { useDeletePatientsByObraSocial } from '@/hooks/useDeletePatientsByObraSocial';

const DeletePatientsByObraSocialDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedObraSocialId, setSelectedObraSocialId] = useState<string>('');
  const [confirmStep, setConfirmStep] = useState(false);
  
  const { data: obrasSociales } = useObrasSociales();
  const { data: patients } = usePatients();
  const deletePatients = useDeletePatientsByObraSocial();

  const patientCount = useMemo(() => {
    if (!selectedObraSocialId || !patients) return 0;
    return patients.filter(p => p.obra_social_id?.toString() === selectedObraSocialId).length;
  }, [selectedObraSocialId, patients]);

  const selectedObraSocialName = useMemo(() => {
    if (!selectedObraSocialId || !obrasSociales) return '';
    return obrasSociales.find(os => os.id.toString() === selectedObraSocialId)?.nombre || '';
  }, [selectedObraSocialId, obrasSociales]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedObraSocialId('');
      setConfirmStep(false);
    }
  };

  const handleContinue = () => {
    if (patientCount > 0) {
      setConfirmStep(true);
    }
  };

  const handleDelete = () => {
    if (selectedObraSocialId) {
      deletePatients.mutate(parseInt(selectedObraSocialId), {
        onSuccess: () => {
          handleOpenChange(false);
        }
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Eliminar por Obra Social
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Pacientes por Obra Social
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {!confirmStep ? (
              <>
                <p>Seleccione la obra social cuyos pacientes desea eliminar:</p>
                <Select
                  value={selectedObraSocialId}
                  onValueChange={setSelectedObraSocialId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar obra social" />
                  </SelectTrigger>
                  <SelectContent>
                    {obrasSociales?.filter(os => os.activa).map((obraSocial) => (
                      <SelectItem key={obraSocial.id} value={obraSocial.id.toString()}>
                        {obraSocial.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedObraSocialId && (
                  <p className="text-sm font-medium">
                    Se encontraron <span className="text-destructive font-bold">{patientCount}</span> pacientes 
                    activos de esta obra social.
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive font-semibold text-center text-lg">
                    ⚠️ ATENCIÓN ⚠️
                  </p>
                  <p className="text-center mt-2">
                    Esta acción <span className="font-bold">NO SE PUEDE DESHACER</span>.
                  </p>
                </div>
                <p>
                  Está a punto de eliminar <span className="font-bold text-destructive">{patientCount} pacientes</span> de{' '}
                  <span className="font-bold">{selectedObraSocialName}</span>.
                </p>
                <p className="text-sm text-muted-foreground">
                  Los pacientes serán marcados como inactivos y no aparecerán en las listas.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmStep(false)}>
            Cancelar
          </AlertDialogCancel>
          {!confirmStep ? (
            <Button
              onClick={handleContinue}
              disabled={!selectedObraSocialId || patientCount === 0}
              variant="destructive"
            >
              Continuar
            </Button>
          ) : (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePatients.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePatients.isPending ? 'Eliminando...' : `Eliminar ${patientCount} pacientes`}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePatientsByObraSocialDialog;
