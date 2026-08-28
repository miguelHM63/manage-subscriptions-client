import { BulbFilled, BulbOutlined } from '@ant-design/icons';
import { Switch } from 'antd';

import { useTheme } from '@/hooks/use-theme';

/** Switch simple Claro/Oscuro. Parte de la preferencia resuelta (incl. sistema). */
export function ThemeToggle() {
  const { isDark, setMode } = useTheme();

  return (
    <Switch
      checked={isDark}
      onChange={checked => setMode(checked ? 'dark' : 'light')}
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
    />
  );
}
