import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User, Loader2 } from 'lucide-react';
import { Patient } from '@/hooks/usePatients';

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onSelect: (patient: Patient) => void;
  selectedPatient?: Patient | null;
}

const ITEMS_PER_PAGE = 50;

const PatientTable: React.FC<PatientTableProps> = ({ 
  patients, 
  onEdit, 
  onDelete, 
  onSelect, 
  selectedPatient 
}) => {
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset displayed count when patients change (e.g., when filtering)
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [patients]);

  const displayedPatients = patients.slice(0, displayedCount);
  const hasMore = displayedCount < patients.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    // Small delay to show loading state for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, patients.length));
      setIsLoadingMore(false);
    }, 150);
  }, [isLoadingMore, hasMore, patients.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <div ref={containerRef} className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Fecha Nac.</TableHead>
            <TableHead>Localidad</TableHead>
            <TableHead>Obra Social</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Consultas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedPatients.map((patient) => (
            <TableRow 
              key={patient.id}
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelect(patient)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{patient.nombre} {patient.apellido}</div>
                    {patient.sexo && (
                      <div className="text-sm text-gray-500">{patient.sexo}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono">{patient.dni}</TableCell>
              <TableCell>
                {new Date(patient.fecha_nacimiento).toLocaleDateString('es-AR')}
              </TableCell>
              <TableCell>
                <div>
                  {patient.localidad && <div>{patient.localidad}</div>}
                  {patient.provincia && (
                    <div className="text-sm text-gray-500">{patient.provincia}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {patient.obra_social?.nombre || 'Sin obra social'}
                  </div>
                  {patient.numero_afiliado && (
                    <div className="text-sm text-gray-500">
                      Nº {patient.numero_afiliado}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {patient.plan ? (
                  <Badge variant="outline">{patient.plan}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      patient.consultas_mes_actual >= patient.consultas_maximas 
                        ? "destructive" 
                        : "default"
                    }
                  >
                    {patient.consultas_mes_actual}/{patient.consultas_maximas}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={patient.activo ? "default" : "secondary"}>
                  {patient.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(patient);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(patient);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Load more trigger and indicator */}
      <div ref={loadMoreRef} className="py-4 text-center">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando más pacientes...</span>
          </div>
        )}
        {hasMore && !isLoadingMore && (
          <p className="text-sm text-muted-foreground">
            Mostrando {displayedCount} de {patients.length} pacientes
          </p>
        )}
        {!hasMore && patients.length > ITEMS_PER_PAGE && (
          <p className="text-sm text-muted-foreground">
            Se han cargado todos los {patients.length} pacientes
          </p>
        )}
      </div>
    </div>
  );
};

export default PatientTable;