
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUpdateUser } from '@/hooks/useUpdateUser';

interface UserFormData {
  username: string;
  full_name: string;
  email: string;
}

const UserSettingsForm = () => {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const updateUser = useUpdateUser();

  const form = useForm<UserFormData>({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
    },
  });

  // Actualizar valores del formulario cuando se cargan los datos del usuario
  React.useEffect(() => {
    if (currentUser) {
      form.reset({
        username: currentUser.username || '',
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
      });
    }
  }, [currentUser, form]);

  const onSubmit = (data: UserFormData) => {
    updateUser.mutate(data);
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Configuración del Usuario
        </CardTitle>
        <CardDescription>
          Actualiza tu información personal y datos de la cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa tu nombre completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa tu nombre de usuario"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Ingresa tu email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={updateUser.isPending}
                className="min-w-32"
              >
                {updateUser.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserSettingsForm;
