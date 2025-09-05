
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { AutorizacionPrestacionFormData } from '@/hooks/useAutorizacionPrestaciones';
import { useNomecladorSearch } from '@/hooks/useNomeclador';

interface SimplePrestacionInputProps {
  index: number;
  prestacion: AutorizacionPrestacionFormData;
  prestaciones: AutorizacionPrestacionFormData[];
  onPrestacionesChange: (prestaciones: AutorizacionPrestacionFormData[]) => void;
}

const SimplePrestacionInput: React.FC<SimplePrestacionInputProps> = ({ 
  index, 
  prestacion, 
  prestaciones, 
  onPrestacionesChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data: suggestions } = useNomecladorSearch(searchTerm);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: any) => {
    console.log('Seleccionando prestación:', suggestion.codigo_practica, suggestion.descripcion_practica);
    
    // Limpiar el campo de búsqueda
    setSearchTerm('');
    setShowSuggestions(false);
    
    // Actualizar la prestación en el índice específico
    const nuevasPrestaciones = [...prestaciones];
    nuevasPrestaciones[index] = {
      ...nuevasPrestaciones[index],
      prestacion_codigo: suggestion.codigo_practica,
      prestacion_descripcion: suggestion.descripcion_practica
    };
    
    // Actualizar el estado global
    onPrestacionesChange(nuevasPrestaciones);
  };

  return (
    <div className="relative">
      <Input
        value={searchTerm}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(searchTerm.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Buscar prestación por código o descripción..."
      />
      
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.slice(0, 10).map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium text-sm">{suggestion.codigo_practica}</div>
              <div className="text-gray-600 text-xs truncate">{suggestion.descripcion_practica}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface MultiplePrestacionesSelectorProps {
  prestaciones: AutorizacionPrestacionFormData[];
  onPrestacionesChange: (prestaciones: AutorizacionPrestacionFormData[]) => void;
}

const MultiplePrestacionesSelector: React.FC<MultiplePrestacionesSelectorProps> = ({
  prestaciones,
  onPrestacionesChange
}) => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buscar Prestación</Label>
                <SimplePrestacionInput
                  index={index}
                  prestacion={prestacion}
                  prestaciones={prestaciones}
                  onPrestacionesChange={onPrestacionesChange}
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

            {prestacion.prestacion_codigo && (
              <div className="space-y-2">
                <Label>Código de Prestación Seleccionado</Label>
                <Input
                  value={prestacion.prestacion_codigo}
                  disabled
                  className="bg-green-50 border-green-200 font-mono"
                />
              </div>
            )}

            {prestacion.prestacion_descripcion && (
              <div className="space-y-2">
                <Label>Descripción de la Prestación</Label>
                <Input
                  value={prestacion.prestacion_descripcion}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}

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
