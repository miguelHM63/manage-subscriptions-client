import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';
import { PROFILE_ROUTE } from '@/routes/routes';
import { ThemeToggle } from './theme-toggle';

/** Cabecera superior visible solo en móvil (marca + perfil + tema + salir). */
export function PanelTopBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
      <span className="text-lg font-black text-brand-primary">Plancito</span>
      <div className="flex items-center">
        <Button
          type="text"
          onClick={() => navigate(PROFILE_ROUTE)}
          aria-label="Mi cuenta"
          icon={<UserOutlined />}
        />
        <ThemeToggle />
        <Button
          type="text"
          onClick={() => logout?.()}
          aria-label="Cerrar sesión"
          icon={<LogoutOutlined />}
        />
      </div>
    </header>
  );
}
