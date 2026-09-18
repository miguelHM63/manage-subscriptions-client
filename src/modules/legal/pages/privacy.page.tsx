import { APP_NAME } from '@/config';
import { ContactLine, LegalPage, LegalSection } from '../components/legal-page';

export function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        En {APP_NAME} ayudamos a llevar el control de clientes, cuentas y vencimientos. Esta política explica qué
        datos guardamos, para qué los usamos y cómo puedes pedir que los eliminemos.
      </p>

      <LegalSection title="Datos que recopilamos">
        <ul>
          <li>
            <strong>Tu cuenta:</strong> correo electrónico, contraseña (se guarda cifrada con hash, nunca en texto
            plano), nombre del negocio y, si los añades, tu nombre, apellido y teléfono.
          </li>
          <li>
            <strong>Si entras con Google:</strong> tu correo, nombre, foto de perfil y el identificador de tu cuenta de
            Google. No accedemos a tus contactos, archivos, correos ni a ningún otro dato de tu cuenta de Google.
          </li>
          <li>
            <strong>Lo que registras en la app:</strong> tus clientes (nombre, teléfono, correo), las ventas y
            suscripciones, y las cuentas de proveedor con sus credenciales, que se guardan cifradas.
          </li>
          <li>
            <strong>Datos técnicos:</strong> registros del servidor (por ejemplo, la dirección IP y los errores) para
            mantener el servicio seguro y funcionando.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Para qué los usamos">
        <ul>
          <li>Crear tu cuenta, iniciar sesión y mostrarte tu información.</li>
          <li>Enviarte correos del servicio, como el de recuperación de contraseña.</li>
          <li>Proteger el servicio y detectar usos indebidos.</li>
        </ul>
        <p>No vendemos tus datos ni los usamos para publicidad.</p>
      </LegalSection>

      <LegalSection title="Datos de tus clientes">
        <p>
          Los datos de las personas que registras como clientes son tuyos. Nosotros solo los guardamos para que puedas
          usarlos dentro de la app, y tú eres responsable de tener derecho a registrarlos.
        </p>
      </LegalSection>

      <LegalSection title="Con quién los compartimos">
        <p>
          Solo con los proveedores que hacen posible el servicio: alojamiento e infraestructura, envío de correo y
          Google, cuando eliges iniciar sesión con tu cuenta de Google. No los compartimos con nadie más, salvo que una
          ley nos obligue.
        </p>
      </LegalSection>

      <LegalSection title="Seguridad">
        <p>
          La comunicación con la app va por HTTPS, las contraseñas se guardan con hash y las credenciales de cuentas de
          proveedor se guardan cifradas. Ningún sistema es infalible, pero nos tomamos en serio protegerlos.
        </p>
      </LegalSection>

      <LegalSection title="Cuánto tiempo los guardamos y cómo eliminarlos">
        <p>
          Guardamos tus datos mientras tengas la cuenta. Puedes pedir que se corrijan o se eliminen, junto con tu
          cuenta, escribiéndonos.
        </p>
        <ContactLine />
      </LegalSection>

      <LegalSection title="Cambios en esta política">
        <p>
          Si cambiamos algo importante, actualizaremos esta página y la fecha de arriba. Seguir usando {APP_NAME} después de un
          cambio significa que lo aceptas.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
