
import { useMemo } from 'react';
import { isToday, isThisWeek, startOfToday } from 'date-fns';
import { type Turno } from './useTurnos';

export const useTurnosStats = (turnos: Turno[]) => {
  return useMemo(() => {
    const today = startOfToday();
    
    const turnosHoy = turnos.filter(turno => 
      isToday(new Date(turno.fecha))
    ).length;

    const turnosEstaSemana = turnos.filter(turno => 
      isThisWeek(new Date(turno.fecha), { weekStartsOn: 1 })
    ).length;

    const turnosPendientes = turnos.filter(turno => 
      turno.estado === 'programado'
    ).length;

    const turnosConfirmados = turnos.filter(turno => 
      turno.estado === 'confirmado'
    ).length;

    return {
      turnosHoy,
      turnosEstaSemana,
      turnosPendientes,
      turnosConfirmados
    };
  }, [turnos]);
};
