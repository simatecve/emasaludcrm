
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: number;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  } | null;
}

export const useAuditLogs = (limit = 100) => {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      // Primero obtenemos los logs de auditoría
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (auditError) throw auditError;

      // Luego obtenemos los datos de usuarios para cada log
      const logsWithUsers = await Promise.all(
        (auditData || []).map(async (log: any) => {
          if (log.user_id) {
            const { data: userData } = await supabase
              .from('users')
              .select('full_name, email')
              .eq('id', log.user_id)
              .single();
            
            return {
              ...log,
              users: userData
            };
          }
          return {
            ...log,
            users: null
          };
        })
      );

      return logsWithUsers as AuditLog[];
    },
  });
};
