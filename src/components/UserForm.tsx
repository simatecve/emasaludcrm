
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateUser, useUpdateUser, useChangePassword } from '@/hooks/useUsers';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface UserFormProps {
  user?: any;
  onClose: () => void;
}

const UserForm = ({ user, onClose }: UserFormProps) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    username: user?.username || '',
    full_name: user?.full_name || '',
    role: user?.role || 'usuario_normal',
    is_active: user?.is_active ?? true,
  });

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role as 'admin' | 'usuario_normal' | 'prestador',
          is_active: formData.is_active,
        }
      });
    } else {
      if (!formData.password) {
        alert('La contraseña es requerida para crear un nuevo usuario');
        return;
      }
      await createMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role as 'admin' | 'usuario_normal' | 'prestador',
      });
    }
    
    onClose();
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      alert('Ingrese una nueva contraseña');
      return;
    }
    
    await changePasswordMutation.mutateAsync({
      userId: user.id,
      newPassword: newPassword
    });
    
    setNewPassword('');
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {user ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!!user}
            required
          />
        </div>

        {!user && (
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="usuario_normal">Usuario Normal</SelectItem>
              <SelectItem value="prestador">Prestador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Usuario Activo</Label>
        </div>

        {user && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Cambiar Contraseña</h4>
              <div className="space-y-2">
                <Label htmlFor="new_password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingrese nueva contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending || !newPassword}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </Button>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {user ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              user ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </div>
      </form>
    </>
  );
};

export default UserForm;
