
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Patient } from '@/hooks/usePatients';

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatientId?: number;
  onSelect: (patientId: number) => void;
  placeholder?: string;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({
  patients,
  selectedPatientId,
  onSelect,
  placeholder = "Seleccionar paciente..."
}) => {
  const [open, setOpen] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPatient ? (
            <div className="flex flex-col items-start">
              <span>{selectedPatient.nombre} {selectedPatient.apellido}</span>
              <span className="text-xs text-gray-500">DNI: {selectedPatient.dni}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar por nombre, apellido o DNI..." 
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={`${patient.nombre} ${patient.apellido} ${patient.dni}`}
                  onSelect={() => {
                    onSelect(patient.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {patient.nombre} {patient.apellido}
                      </span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedPatientId === patient.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>DNI: {patient.dni}</span>
                      {patient.obra_social?.nombre && (
                        <span>OS: {patient.obra_social.nombre}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default PatientSelector;
