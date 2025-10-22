
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCreateNomeclador, useUpdateNomeclador } from '@/hooks/useNomecladorCrud';
import { Nomenclador } from '@/hooks/useNomeclador';

interface NomecladorFormProps {
  nomenclador?: Nomenclador;
  onClose: () => void;
}

interface FormData {
  codigo_practica: string;
  descripcion_practica: string;
  valor_resultante_unidades: string;
}

const NomecladorForm = ({ nomenclador, onClose }: NomecladorFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    codigo_practica: nomenclador?.codigo_practica || '',
    descripcion_practica: nomenclador?.descripcion_practica || '',
    valor_resultante_unidades: nomenclador?.valor_resultante_unidades || '',
  });

  const createMutation = useCreateNomeclador();
  const updateMutation = useUpdateNomeclador();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo_practica || !formData.descripcion_practica) {
      return;
    }

    const submitData = {
      ...formData,
      valor_resultante_unidades: formData.valor_resultante_unidades || null
    };

    if (nomenclador) {
      await updateMutation.mutateAsync({ id: nomenclador.id, data: submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
    
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {nomenclador ? 'Editar Nomenclador' : 'Nuevo Nomenclador'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo_practica">Código de Práctica *</Label>
            <Input
              id="codigo_practica"
              type="text"
              value={formData.codigo_practica}
              onChange={(e) => setFormData({ ...formData, codigo_practica: e.target.value })}
              placeholder="Ej: 160101"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion_practica">Descripción de la Práctica *</Label>
            <Textarea
              id="descripcion_practica"
              value={formData.descripcion_practica}
              onChange={(e) => setFormData({ ...formData, descripcion_practica: e.target.value })}
              placeholder="Descripción detallada de la práctica médica"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor_resultante_unidades">Valor Resultante (Unidades)</Label>
            <Input
              id="valor_resultante_unidades"
              type="text"
              value={formData.valor_resultante_unidades}
              onChange={(e) => setFormData({ ...formData, valor_resultante_unidades: e.target.value })}
              placeholder="Valor en unidades"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.codigo_practica || !formData.descripcion_practica}
            >
              {isLoading ? 'Guardando...' : nomenclador ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NomecladorForm;
