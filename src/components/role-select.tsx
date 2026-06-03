import useEnumTranslation from '@/hooks/use-enum-translation';
import { RolesEnum } from '@/types/roles.enum';
import { Form, Select } from 'antd';
import { useMemo } from 'react';

export function RoleSelect({ placeholder }: { placeholder?: string }) {
  const form = Form.useFormInstance();
  const onChange = (value: string) => {
    form.setFieldsValue({ role: value });
  };

  const { translateEnum } = useEnumTranslation('roles');

  const option = useMemo(() => {
    return [
      { label: translateEnum(RolesEnum.ADMIN), value: RolesEnum.ADMIN },
      { label: translateEnum(RolesEnum.USER), value: RolesEnum.USER },
    ];
  }, [translateEnum]);
  return <Select placeholder={placeholder} onChange={onChange} options={option}></Select>;
}
