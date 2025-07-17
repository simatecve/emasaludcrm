import React from 'react';
import { Calendar, Users, FileText, Settings, BarChart3, Shield, Activity, ChevronLeft, LogOut, UserCog, Stethoscope, Building2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const { signOut } = useAuth();
  const { data: systemConfig } = useSystemConfig();
  const { data: currentUser } = useCurrentUser();

  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: BarChart3 },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'appointments', label: 'Turnos', icon: Calendar },
    { id: 'medicos', label: 'Médicos', icon: UserCog },
    { id: 'especialidades', label: 'Especialidades', icon: Stethoscope },
    { id: 'obras-sociales', label: 'Obras Sociales', icon: Building2 },
    { id: 'nomenclador', label: 'Nomenclador', icon: BookOpen },
    { id: 'reports', label: 'Informes', icon: FileText },
    { id: 'authorizations', label: 'Autorizaciones', icon: Shield },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={cn(
      "bg-slate-900 text-white min-h-screen p-4 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
          {systemConfig?.logo_url ? (
            <img 
              src={systemConfig.logo_url} 
              alt="Logo" 
              className="h-8 w-8 object-contain flex-shrink-0"
            />
          ) : (
            <Activity className="h-8 w-8 text-blue-400 flex-shrink-0" />
          )}
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold">{systemConfig?.name || 'EMA SALUD'}</h1>
              <p className="text-sm text-slate-400">{systemConfig?.subtitle || 'Sistema de Gestión'}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-white p-1"
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left",
                activeSection === item.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      
      <div className={cn(
        "mt-8 pt-4 border-t border-slate-700",
        isCollapsed && "text-center"
      )}>
        {!isCollapsed && currentUser && (
          <div className="text-sm text-slate-400 mb-4">
            <p className="font-medium text-white">{currentUser.full_name}</p>
            <p>{currentUser.email}</p>
            <p className="capitalize">{currentUser.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full text-slate-300 hover:text-white hover:bg-slate-800",
            isCollapsed ? "justify-center p-3" : "justify-start"
          )}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
