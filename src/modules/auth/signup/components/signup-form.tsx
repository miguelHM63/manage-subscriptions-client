import { REQUIRED_TEXT } from '@/constants';
import { Button, Form, Input, message } from 'antd';
import type { RuleObject } from 'antd/es/form';
import type { StoreValue } from 'antd/es/form/interface';
import { useSignup, type SignupBody } from '../hooks/use-signup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '@/routes/routes';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';

export function SignupForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const fieldTranslation = useMemo(() => {
    return {
      businessName: t('signUp.fields.businessName'),
      email: t('signUp.fields.email'),
      password: t('signUp.fields.password'),
      confirmPassword: t('signUp.fields.confirmPassword'),
    };
  }, [t]);
  const [invalidateForm, form] = useFormErrorHandler();

  const { mutate: signup, isPending: isLoading } = useSignup({
    onSuccess: data => {
      message.success(t('signUp.success'));
      // Auto-login: el backend devuelve token + user al registrar.
      setSession?.(data.token, data.user);
    },
    onError: error => {
      invalidateForm(error);
    },
  });

  const validateConfirmPassword = ({ getFieldValue }: StoreValue) => ({
    validator(_: RuleObject, value: string) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(t('signUp.validation.password.mismatch')));
    },
  });

  const validateSecurePassword = () => ({
    validator(_: RuleObject, value: string) {
      if (!value || value.length < 8) {
        return Promise.reject(new Error(t('signUp.validation.password.minLength')));
      }
      return Promise.resolve();
    },
  });

  const onFinish = (values: SignupBody) => {
    signup({
      businessName: values.businessName,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Form layout="vertical" size="large" className="mt-8 w-full" onFinish={onFinish} form={form}>
      <Form.Item label={fieldTranslation.businessName} name="businessName" rules={REQUIRED_TEXT}>
        <Input placeholder={fieldTranslation.businessName} disabled={isLoading} />
      </Form.Item>
      <Form.Item label={fieldTranslation.email} name="email" rules={REQUIRED_TEXT}>
        <Input type="email" placeholder={fieldTranslation.email} disabled={isLoading} />
      </Form.Item>
      <Form.Item
        label={fieldTranslation.password}
        name="password"
        rules={[...REQUIRED_TEXT, validateSecurePassword()]}
      >
        <Input type="password" placeholder={fieldTranslation.password} disabled={isLoading} />
      </Form.Item>
      <Form.Item
        label={fieldTranslation.confirmPassword}
        name="confirmPassword"
        dependencies={['password']}
        rules={[validateConfirmPassword]}
      >
        <Input
          type="password"
          placeholder={fieldTranslation.confirmPassword}
          disabled={isLoading}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" className="w-full mt-2" loading={isLoading}>
        {t('signUp.summitText')}
      </Button>
      <Button
        type="link"
        className="w-full mt-2"
        onClick={() => navigate(LOGIN_ROUTE)}
        disabled={isLoading}
      >
        {t('signUp.alreadyHaveAccount')}
      </Button>
    </Form>
  );
}
