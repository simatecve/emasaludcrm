
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import PatientManagement from '@/components/PatientManagement';
import AppointmentScheduler from '@/components/AppointmentScheduler';
import MedicoManagement from '@/components/MedicoManagement';
import EspecialidadManagement from '@/components/EspecialidadManagement';
import ObraSocialManagement from '@/components/ObraSocialManagement';
import AutorizacionManagement from '@/components/AutorizacionManagement';
import NomecladorManagement from '@/components/NomecladorManagement';
import UserManagement from '@/components/UserManagement';
import AuditLogs from '@/components/AuditLogs';
import Login from './Login';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <PatientManagement />;
      case 'appointments':
        return <AppointmentScheduler />;
      case 'medicos':
        return <MedicoManagement />;
      case 'especialidades':
        return <EspecialidadManagement />;
      case 'obras-sociales':
        return <ObraSocialManagement />;
      case 'nomenclador':
        return <NomecladorManagement />;
      case 'authorizations':
        return <AutorizacionManagement />;
      case 'users':
        return <UserManagement />;
      case 'audit-logs':
        return <AuditLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 overflow-auto">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default Index;
