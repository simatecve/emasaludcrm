
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNomecladorCrud } from '@/hooks/useNomecladorCrud';

interface PrestacionSelectorProps {
  onSelect: (prestacion: { codigo: string; descripcion: string }) => void;
}

const PrestacionSelector: React.FC<PrestacionSelectorProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrestacion, setSelectedPrestacion] = useState<{ codigo: string; descripcion: string } | null>(null);

  const { data: prestaciones } = useNomecladorCrud();

  const filteredPrestaciones = prestaciones?.filter(prestacion =>
    prestacion.codigo_practica.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestacion.descripcion_practica.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (prestacion: any) => {
    const selectedData = {
      codigo: prestacion.codigo_practica,
      descripcion: prestacion.descripcion_practica
    };
    setSelectedPrestacion(selectedData);
    onSelect(selectedData);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Search className="mr-2 h-4 w-4" />
          {selectedPrestacion ? 
            `${selectedPrestacion.codigo} - ${selectedPrestacion.descripcion}` : 
            'Buscar prestación...'
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 space-y-4">
          <Input
            placeholder="Buscar por código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredPrestaciones?.map((prestacion) => (
              <div
                key={prestacion.id}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded text-sm"
                onClick={() => handleSelect(prestacion)}
              >
                <div className="font-medium">{prestacion.codigo_practica}</div>
                <div className="text-gray-600 text-xs">{prestacion.descripcion_practica}</div>
              </div>
            ))}
            
            {filteredPrestaciones?.length === 0 && searchTerm && (
              <div className="p-2 text-gray-500 text-sm">
                No se encontraron prestaciones
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PrestacionSelector;
