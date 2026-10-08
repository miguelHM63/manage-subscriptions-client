import { navLabel } from '@/components/panel/panel-nav-items';
import type { IProviderAccount } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import type { IService } from '@/modules/services/hooks/use-services';
import { logoForDomain } from '@/modules/services/popular-services';
import { PROVIDER_ACCOUNTS_ROUTE } from '@/routes/routes';
import { CAPTION_HOLD } from '../remotion/caption-timing';
import { buildSoundCues } from '../remotion/sound-cues';
import { bySelector, byText, type TargetFinder } from '../remotion/targets';
import { realDuration, realFrame, type CursorMove, type Hold } from '../remotion/timeline';

// Guion del tutorial «Registrar una cuenta»: qué pasa y cuándo. El render está
// en provider-account-tutorial.tsx.

// Datos de ejemplo (siguen al tutorial de servicios): nada de esto llama a la API.
export const SERVICES: IService[] = [
  { id: 'tutorial-netflix', name: 'Netflix', iconUrl: logoForDomain('netflix.com') },
  { id: 'tutorial-crunchyroll', name: 'Crunchyroll', iconUrl: logoForDomain('crunchyroll.com') },
];
export const CAPACITY = 5;
export const COST = 45;
export const USERNAME = 'netflix@tucorreo.com';
export const PASSWORD = 'clave1234';

export const ACCOUNT: IProviderAccount = {
  id: 'tutorial-account',
  serviceId: SERVICES[0].id,
  username: USERNAME,
  capacity: CAPACITY,
  usedSlots: 0,
  availableSlots: CAPACITY,
  cost: COST * 100,
};

// Guion (frames a 30 fps, tiempo de la escena: sin contar las pausas).
export const F = {
  openAccounts: 55,
  showAccounts: 62,
  openForm: 104,
  formOpen: 108,
  selectClick: 138,
  selectOpen: 140,
  optionClick: 172,
  selected: 174,
  capacityClick: 203,
  capacitySet: 208,
  costClick: 233,
  costSet: 238,
  scrollStart: 266,
  scrollEnd: 290,
  usernameClick: 311,
  usernameTyping: 314,
  passwordClick: 373,
  passwordTyping: 376,
  create: 432,
  created: 456,
  done: 470,
  end: 560,
};

export const MOVES: CursorMove[] = [
  { start: 15, end: 50, target: 'nav' },
  { start: 75, end: 100, target: 'addAccount' },
  { start: 115, end: 135, target: 'select' },
  { start: 150, end: 168, target: 'option' },
  { start: 184, end: 200, target: 'capacity' },
  { start: 214, end: 230, target: 'cost' },
  { start: 292, end: 308, target: 'username' },
  { start: 356, end: 370, target: 'password' },
  { start: 404, end: 428, target: 'create' },
];

const CLICKS = [
  F.openAccounts,
  F.openForm,
  F.selectClick,
  F.optionClick,
  F.capacityClick,
  F.costClick,
  F.usernameClick,
  F.passwordClick,
  F.create,
];

export const TARGETS: Record<string, TargetFinder> = {
  nav: bySelector(`[data-nav="${PROVIDER_ACCOUNTS_ROUTE}"]`),
  addAccount: byText('button', 'Agregar cuenta'),
  select: bySelector('.ant-modal .ant-select, .ant-drawer .ant-select'),
  option: byText('.ant-select-item-option', SERVICES[0].name),
  capacity: bySelector('input#capacity'),
  cost: bySelector('input#cost'),
  username: bySelector('input#username'),
  password: bySelector('input#password'),
  create: bySelector('.ant-modal-footer .ant-btn-primary, .ant-drawer-footer .ant-btn-primary'),
};

/** Contenedor con scroll del formulario (modal en escritorio, hoja en móvil). */
export const FORM_SCROLLER = bySelector('.ant-modal-wrap, .ant-drawer-body');

const SECTION = navLabel(PROVIDER_ACCOUNTS_ROUTE);

export const CAPTIONS = [
  { from: 0, step: 1, text: `Registra la cuenta que compras en «${SECTION}»` },
  { from: F.showAccounts, step: 2, text: 'Cada cuenta tiene cupos: uno por cliente' },
  { from: F.formOpen, step: 3, text: 'Elige el servicio de la cuenta' },
  { from: 180, step: 4, text: 'Indica sus cupos y cuánto te cuesta' },
  { from: 262, step: 5, text: 'Guarda el usuario y la contraseña' },
  { from: 400, step: 6, text: 'Pulsa Crear y listo' },
];

// Cada subtítulo pausa la escena mientras se presenta a pantalla completa.
export const HOLDS: Hold[] = CAPTIONS.map(c => ({ at: c.from, duration: CAPTION_HOLD }));
export const REAL_CLICKS = CLICKS.map(c => realFrame(c, HOLDS));

export const PROVIDER_ACCOUNT_DURATION = realDuration(F.end, HOLDS);

// Sonidos: clics, teclas, lo que aparece, las preguntas y el cierre.
export const SOUND_CUES = buildSoundCues(
  {
    clicks: CLICKS,
    typing: [
      { text: String(CAPACITY), start: F.capacitySet },
      { text: String(COST), start: F.costSet - 2 },
      { text: USERNAME, start: F.usernameTyping },
      { text: PASSWORD, start: F.passwordTyping },
    ],
    pops: [F.formOpen, F.selectOpen, F.created],
    captions: CAPTIONS.map(c => c.from),
    done: F.done,
  },
  HOLDS,
);
