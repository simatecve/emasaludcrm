
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Turno } from '@/hooks/useTurnos';

interface TurnoCardProps {
  turno: Turno;
  onEdit: (turno: Turno) => void;
  onDelete: (id: number) => void;
}

const TurnoCard = ({ turno, onEdit, onDelete }: TurnoCardProps) => {
  const getEstadoBadge = (estado: string) => {
    const variants = {
      programado: 'default',
      confirmado: 'secondary',
      cancelado: 'destructive',
      completado: 'outline'
    } as const;

    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'default'}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            <div>
              <h3 className="font-semibold text-lg">
                {turno.pacientes?.nombre || 'N/A'} {turno.pacientes?.apellido || 'N/A'}
              </h3>
              <p className="text-sm text-gray-600">DNI: {turno.pacientes?.dni || 'N/A'}</p>
            </div>
            
            <div>
              <p className="font-medium">Dr. {turno.medicos?.nombre || 'N/A'} {turno.medicos?.apellido || 'N/A'}</p>
              <p className="text-sm text-gray-600">Mat: {turno.medicos?.matricula || 'N/A'}</p>
              {turno.medicos?.especialidades && (
                <p className="text-sm text-blue-600">{turno.medicos.especialidades.nombre}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span>{new Date(turno.fecha).toLocaleDateString()}</span>
              <Clock className="h-4 w-4 text-gray-400 ml-2" />
              <span>{turno.hora}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {getEstadoBadge(turno.estado)}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(turno)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar turno?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente el turno.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(turno.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {turno.motivo && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm"><strong>Motivo:</strong> {turno.motivo}</p>
          </div>
        )}
        
        {turno.observaciones && (
          <div className="mt-2">
            <p className="text-sm"><strong>Observaciones:</strong> {turno.observaciones}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TurnoCard;
