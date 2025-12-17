import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const UpdateConsultasMaximasDialog = () => {
  const [open, setOpen] = useState(false);
  const [consultasMaximas, setConsultasMaximas] = useState('2');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    const value = parseInt(consultasMaximas);
    
    if (isNaN(value) || value < 1) {
      toast.error('Ingrese un número válido mayor a 0');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-consultas-maximas', {
        body: { consultas_maximas: value }
      });

      if (error) throw error;

      toast.success(data.message || `Pacientes actualizados correctamente`);
      setOpen(false);
    } catch (error: any) {
      console.error('Error actualizando consultas máximas:', error);
      toast.error(error.message || 'Error al actualizar los pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Actualizar Consultas Máx.
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Consultas Máximas</DialogTitle>
          <DialogDescription>
            Esta acción actualizará el límite de consultas máximas mensuales para TODOS los pacientes activos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="consultas">Consultas máximas por mes</Label>
          <Input
            id="consultas"
            type="number"
            min="1"
            value={consultasMaximas}
            onChange={(e) => setConsultasMaximas(e.target.value)}
            className="mt-2"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? 'Actualizando...' : 'Actualizar Todos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateConsultasMaximasDialog;
