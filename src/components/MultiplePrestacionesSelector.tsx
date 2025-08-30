
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import PrestacionSelector from './PrestacionSelector';
import { AutorizacionPrestacionFormData } from '@/hooks/useAutorizacionPrestaciones';

interface MultiplePrestacionesSelectorProps {
  prestaciones: AutorizacionPrestacionFormData[];
  onPrestacionesChange: (prestaciones: AutorizacionPrestacionFormData[]) => void;
}

const MultiplePrestacionesSelector: React.FC<MultiplePrestacionesSelectorProps> = ({
  prestaciones,
  onPrestacionesChange
}) => {
  const [showPrestacionSelector, setShowPrestacionSelector] = useState<number | null>(null);

  const addPrestacion = () => {
    const nuevaPrestacion: AutorizacionPrestacionFormData = {
      prestacion_codigo: '',
      prestacion_descripcion: '',
      cantidad: 1,
      observaciones: ''
    };
    onPrestacionesChange([...prestaciones, nuevaPrestacion]);
  };

  const removePrestacion = (index: number) => {
    const nuevasPrestaciones = prestaciones.filter((_, i) => i !== index);
    onPrestacionesChange(nuevasPrestaciones);
  };

  const updatePrestacion = (index: number, field: keyof AutorizacionPrestacionFormData, value: any) => {
    const nuevasPrestaciones = [...prestaciones];
    nuevasPrestaciones[index] = {
      ...nuevasPrestaciones[index],
      [field]: value
    };
    onPrestacionesChange(nuevasPrestaciones);
  };

  const handlePrestacionSelect = (index: number, prestacion: { codigo: string; descripcion: string }) => {
    updatePrestacion(index, 'prestacion_codigo', prestacion.codigo);
    updatePrestacion(index, 'prestacion_descripcion', prestacion.descripcion);
    setShowPrestacionSelector(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Prestaciones</Label>
        <Button type="button" onClick={addPrestacion} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Agregar Prestación
        </Button>
      </div>

      {prestaciones.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            No hay prestaciones agregadas. Haz clic en "Agregar Prestación" para empezar.
          </CardContent>
        </Card>
      )}

      {prestaciones.map((prestacion, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Prestación {index + 1}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePrestacion(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Prestación</Label>
              {showPrestacionSelector === index ? (
                <div className="space-y-2">
                  <PrestacionSelector
                    onSelect={(prestacionData) => handlePrestacionSelect(index, prestacionData)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPrestacionSelector(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPrestacionSelector(index)}
                  className="w-full"
                >
                  {prestacion.prestacion_codigo || prestacion.prestacion_descripcion ? 
                    'Cambiar Prestación' : 'Seleccionar Prestación'}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código de Prestación</Label>
                <Input
                  value={prestacion.prestacion_codigo}
                  onChange={(e) => updatePrestacion(index, 'prestacion_codigo', e.target.value)}
                  placeholder="Código"
                />
              </div>
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={prestacion.cantidad}
                  onChange={(e) => updatePrestacion(index, 'cantidad', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción de la Prestación</Label>
              <Input
                value={prestacion.prestacion_descripcion}
                onChange={(e) => updatePrestacion(index, 'prestacion_descripcion', e.target.value)}
                placeholder="Descripción"
              />
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                value={prestacion.observaciones || ''}
                onChange={(e) => updatePrestacion(index, 'observaciones', e.target.value)}
                placeholder="Observaciones específicas para esta prestación"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MultiplePrestacionesSelector;
