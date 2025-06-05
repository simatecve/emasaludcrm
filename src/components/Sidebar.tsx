
import React from 'react';
import { Calendar, Users, FileText, Settings, BarChart3, Shield, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: BarChart3 },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'appointments', label: 'Turnos', icon: Calendar },
    { id: 'reports', label: 'Informes', icon: FileText },
    { id: 'authorizations', label: 'Autorizaciones', icon: Shield },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-700">
        <Activity className="h-8 w-8 text-blue-400" />
        <div>
          <h1 className="text-xl font-bold">Clínica Pro</h1>
          <p className="text-sm text-slate-400">Sistema de Gestión</p>
        </div>
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
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-8 pt-4 border-t border-slate-700">
        <div className="text-sm text-slate-400">
          <p>Usuario: Recepcionista</p>
          <p>Sesión activa</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
