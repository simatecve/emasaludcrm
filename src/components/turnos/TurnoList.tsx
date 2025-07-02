
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Turno } from '@/hooks/useTurnos';
import TurnoCard from './TurnoCard';

interface TurnoListProps {
  turnos: Turno[];
  totalTurnos: number;
  onEdit: (turno: Turno) => void;
  onDelete: (id: number) => void;
  onView?: (turno: Turno) => void;
}

const TurnoList = ({ turnos, totalTurnos, onEdit, onDelete, onView }: TurnoListProps) => {
  if (turnos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          {totalTurnos === 0 ? 'No hay turnos registrados' : 'No se encontraron turnos con los filtros aplicados'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Mostrando {turnos.length} de {totalTurnos} turnos
      </div>
      <div className="grid gap-4">
        {turnos.map((turno) => (
          <TurnoCard
            key={turno.id}
            turno={turno}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
};

export default TurnoList;
