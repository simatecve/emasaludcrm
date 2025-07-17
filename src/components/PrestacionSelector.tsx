
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import { useNomeclador } from '@/hooks/useNomeclador';
import { Card, CardContent } from '@/components/ui/card';

interface PrestacionSelectorProps {
  onSelect: (prestacion: { codigo: string; descripcion: string }) => void;
  selectedCodigo?: string;
}

const PrestacionSelector = ({ onSelect, selectedCodigo }: PrestacionSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: prestaciones, isLoading } = useNomeclador(searchTerm);

  const handleSelect = (prestacion: any) => {
    onSelect({
      codigo: prestacion.codigo_practica,
      descripcion: prestacion.descripcion_practica
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Prestación</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Código de prestación"
          value={selectedCodigo || ''}
          readOnly
          className="flex-1"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Seleccionar Prestación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por código o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" disabled>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="text-center py-4">Cargando prestaciones...</div>
                ) : prestaciones?.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No se encontraron prestaciones
                  </div>
                ) : (
                  prestaciones?.map((prestacion) => (
                    <Card 
                      key={prestacion.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSelect(prestacion)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {prestacion.codigo_practica}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {prestacion.descripcion_practica}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Módulo: {prestacion.modulo}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PrestacionSelector;
