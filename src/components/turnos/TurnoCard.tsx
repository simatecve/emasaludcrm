
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Calendar as CalendarIcon, Clock, Eye, User, UserCheck } from 'lucide-react';
import { Turno } from '@/hooks/useTurnos';

interface TurnoCardProps {
  turno: Turno;
  onEdit: (turno: Turno) => void;
  onDelete: (id: number) => void;
  onView?: (turno: Turno) => void;
}

const TurnoCard = ({ turno, onEdit, onDelete, onView }: TurnoCardProps) => {
  const getEstadoBadge = (estado: string) => {
    const variants = {
      programado: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      confirmado: { variant: 'secondary' as const, color: 'bg-green-100 text-green-800' },
      cancelado: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      completado: { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    };

    const config = variants[estado as keyof typeof variants] || variants.programado;

    return (
      <Badge variant={config.variant} className={config.color}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-4">
            {/* Header with patient and status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {turno.pacientes?.nombre || 'N/A'} {turno.pacientes?.apellido || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-600">DNI: {turno.pacientes?.dni || 'N/A'}</p>
                </div>
              </div>
              {getEstadoBadge(turno.estado)}
            </div>
            
            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Médico</span>
                </div>
                <div className="ml-6">
                  <p className="font-medium">Dr. {turno.medicos?.nombre || 'N/A'} {turno.medicos?.apellido || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Mat: {turno.medicos?.matricula || 'N/A'}</p>
                  {turno.medicos?.especialidades && (
                    <p className="text-sm text-blue-600">{turno.medicos.especialidades.nombre}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Fecha y Hora</span>
                </div>
                <div className="ml-6">
                  <p className="font-medium">{new Date(turno.fecha).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{turno.hora}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Información adicional</span>
                <div className="ml-0">
                  {turno.motivo && (
                    <p className="text-sm text-gray-600">
                      <strong>Motivo:</strong> {turno.motivo}
                    </p>
                  )}
                  {turno.observaciones && (
                    <p className="text-sm text-gray-600">
                      <strong>Observaciones:</strong> {turno.observaciones}
                    </p>
                  )}
                  {!turno.motivo && !turno.observaciones && (
                    <p className="text-sm text-gray-400 italic">Sin información adicional</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-2 ml-4">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => onView(turno)}
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onEdit(turno)}
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar turno?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente el turno de{' '}
                    <strong>{turno.pacientes?.nombre} {turno.pacientes?.apellido}</strong> programado para el{' '}
                    <strong>{new Date(turno.fecha).toLocaleDateString()}</strong> a las{' '}
                    <strong>{turno.hora}</strong>.
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
      </CardContent>
    </Card>
  );
};

export default TurnoCard;
