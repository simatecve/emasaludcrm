
import React from 'react';
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
import { Edit, Trash2, User } from 'lucide-react';
import { Patient } from '@/hooks/usePatients';

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onSelect: (patient: Patient) => void;
  selectedPatient?: Patient | null;
}

const PatientTable: React.FC<PatientTableProps> = ({ 
  patients, 
  onEdit, 
  onDelete, 
  onSelect, 
  selectedPatient 
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Fecha Nac.</TableHead>
            <TableHead>Localidad</TableHead>
            <TableHead>Obra Social</TableHead>
            <TableHead>Consultas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
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
    </div>
  );
};

export default PatientTable;
