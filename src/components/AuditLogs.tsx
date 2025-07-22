
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Calendar, User, Activity } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(100);
  const { data: auditLogs, isLoading, error } = useAuditLogs(limit);
  const { data: currentUser } = useCurrentUser();

  const filteredLogs = auditLogs?.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('INSERT')) return 'default';
    if (action.includes('UPDATE')) return 'secondary';
    if (action.includes('DELETE')) return 'destructive';
    return 'outline';
  };

  const getActionLabel = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'CREATE_USER': 'Crear Usuario',
      'UPDATE_USER': 'Actualizar Usuario',
      'INSERT': 'Crear Registro',
      'UPDATE': 'Actualizar Registro',
      'DELETE': 'Eliminar Registro',
    };
    return actionMap[action] || action;
  };

  const getTableLabel = (tableName: string) => {
    const tableMap: { [key: string]: string } = {
      'users': 'Usuarios',
      'pacientes': 'Pacientes',
      'autorizaciones': 'Autorizaciones',
      'medicos': 'Médicos',
      'especialidades': 'Especialidades',
      'obras_sociales': 'Obras Sociales',
      'nomeclador': 'Nomenclador',
      'turnos': 'Turnos',
      'diagnosticos': 'Diagnósticos',
    };
    return tableMap[tableName] || tableName;
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            No tienes permisos para acceder a esta sección. Solo los administradores pueden ver los logs de auditoría.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar logs de auditoría: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoría</h1>
          <p className="text-gray-600">Registro de todas las actividades del sistema</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          {filteredLogs?.length || 0} registros
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por acción, tabla o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="limit">Mostrar:</Label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando logs...</div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Tabla</TableHead>
                    <TableHead>ID Registro</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.users?.full_name || 'Usuario Desconocido'}</div>
                            <div className="text-sm text-gray-500">{log.users?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTableLabel(log.table_name || '')}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.record_id || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron resultados' : 'No hay logs de auditoría'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
