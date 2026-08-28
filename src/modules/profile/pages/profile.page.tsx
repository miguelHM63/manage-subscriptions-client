import { App, Button, Card, Form, Input, Spin } from 'antd';
import { useEffect } from 'react';

import { PageHeader } from '@/components/panel/page-header';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useAuth } from '@/hooks/use-auth';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useMe, useUpdateProfile, type ProfileBody } from '../hooks/use-profile';

function ProfilePageComponent() {
  const { message } = App.useApp();
  const { updateLoggedUser } = useAuth();
  const [invalidateForm, form] = useFormErrorHandler();

  const { data: me, isLoading } = useMe();

  const { mutate: updateProfile, isPending } = useUpdateProfile(updated => {
    updateLoggedUser?.(updated);
    message.success('Perfil actualizado');
  });

  useEffect(() => {
    if (me) {
      form.setFieldsValue({
        firstName: me.profile?.firstName,
        lastName: me.profile?.lastName,
        phone: me.phone,
      });
    }
  }, [me, form]);

  const onFinish = (values: ProfileBody) => {
    updateProfile(
      {
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        phone: values.phone || undefined,
      },
      { onError: invalidateForm },
    );
  };

  return (
    <>
      <PageHeader title="Mi cuenta" subtitle="Edita la información de tu perfil" />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : (
        <Card size="small" className="max-w-lg shadow-sm">
          <Form layout="vertical" form={form} onFinish={onFinish} disabled={isPending}>
            <Form.Item label="Email">
              <Input value={me?.email} disabled />
            </Form.Item>

            <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
              <Form.Item label="Nombre" name="firstName">
                <Input placeholder="Tu nombre" />
              </Form.Item>
              <Form.Item label="Apellido" name="lastName">
                <Input placeholder="Tu apellido" />
              </Form.Item>
            </div>

            <Form.Item label="Teléfono / WhatsApp" name="phone">
              <Input placeholder="+51 999 999 999" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={isPending}>
              Guardar cambios
            </Button>
          </Form>
        </Card>
      )}
    </>
  );
}

export const ProfilePage = withErrorBoundary(ProfilePageComponent);
