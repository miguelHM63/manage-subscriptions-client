import { APP_NAME } from '@/config';
import { ContactLine, LegalPage, LegalSection } from '../components/legal-page';

export function TermsPage() {
  return (
    <LegalPage title="Términos del servicio">
      <p>
        Al crear una cuenta o usar {APP_NAME} aceptas estos términos. Si no estás de acuerdo con ellos, no uses el
        servicio.
      </p>

      <LegalSection title="Qué es el servicio">
        <p>
          {APP_NAME} es una herramienta para organizar clientes, cuentas, ventas y vencimientos. No participa en tus
          ventas ni en tus cobros: solo te ayuda a llevar el control.
        </p>
      </LegalSection>

      <LegalSection title="Tu cuenta">
        <ul>
          <li>Debes dar datos verdaderos y mantener tu contraseña en secreto.</li>
          <li>Eres responsable de lo que ocurra desde tu cuenta.</li>
          <li>Avísanos si crees que alguien accedió a ella sin permiso.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Uso aceptable">
        <ul>
          <li>No uses el servicio para nada ilegal ni para perjudicar a otras personas.</li>
          <li>
            Eres responsable de cumplir las condiciones de los servicios de terceros cuyas cuentas o planes gestionas
            aquí, y de tener derecho a registrar los datos de tus clientes.
          </li>
          <li>No intentes acceder a datos de otras cuentas ni afectar el funcionamiento del servicio.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Planes">
        <p>
          {APP_NAME} tiene un plan gratuito con límites y planes de pago con más capacidad. Los límites de cada plan se
          muestran en la app y pueden cambiar; avisaremos antes de cualquier cambio que te afecte.
        </p>
      </LegalSection>

      <LegalSection title="Disponibilidad y responsabilidad">
        <p>
          Hacemos lo posible por mantener el servicio disponible, pero se ofrece tal cual, sin garantía de que esté libre
          de errores o de interrupciones. Te recomendamos conservar copia de la información que sea crítica para ti.
          En la medida que la ley lo permita, no somos responsables de pérdidas indirectas derivadas del uso del
          servicio.
        </p>
      </LegalSection>

      <LegalSection title="Suspensión y cierre">
        <p>
          Puedes dejar de usar el servicio y pedir que eliminemos tu cuenta cuando quieras. Podemos suspender una
          cuenta que incumpla estos términos.
        </p>
      </LegalSection>

      <LegalSection title="Cambios y contacto">
        <p>
          Podemos actualizar estos términos; la fecha de arriba indica la última revisión. Si tienes dudas sobre ellos:
        </p>
        <ContactLine />
      </LegalSection>
    </LegalPage>
  );
}
