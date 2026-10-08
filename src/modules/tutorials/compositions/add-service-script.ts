import { isBrandSearchEnabled, type BrandResult } from '@/modules/services/hooks/use-brand-search';
import { logoForDomain } from '@/modules/services/popular-services';
import { SERVICES_ROUTE } from '@/routes/routes';
import { CAPTION_HOLD } from '../remotion/caption-timing';
import { buildSoundCues } from '../remotion/sound-cues';
import { bySelector, byText, type TargetFinder } from '../remotion/targets';
import { realDuration, realFrame, type CursorMove, type Hold } from '../remotion/timeline';

// Guion del tutorial «Agregar un servicio»: qué pasa y cuándo. El render está
// en add-service-tutorial.tsx.

// Datos de ejemplo: nada de esto llama a la API.
export const QUICK_ADD = { name: 'Netflix', iconUrl: logoForDomain('netflix.com') };
export const NEW_NAME = 'Crunchyroll';
export const LOGO_QUERY = 'crunch';
export const BRAND: BrandResult = {
  brandId: 'tutorial-crunchyroll',
  name: 'Crunchyroll',
  domain: 'crunchyroll.com',
  icon: logoForDomain('crunchyroll.com'),
};

// Guion (frames a 30 fps). Sin búsqueda de logos (no hay clientId de
// Brandfetch) la app muestra un campo de URL: el tutorial lo señala y sigue.
export const F = {
  openServices: 55,
  showServices: 62,
  quickAdd: 106,
  quickAdded: 135,
  openForm: 184,
  formOpen: 188,
  nameClick: 222,
  nameTyping: 226,
  logoClick: 276,
  logoTyping: 280,
  logoSearching: 294,
  logoResults: 304,
  logoHover: 327,
  logoSelect: 332,
  create: 374,
  created: 398,
  done: 412,
  end: 500,
};

export const MOVES: CursorMove[] = [
  { start: 15, end: 50, target: 'nav' },
  { start: 70, end: 100, target: 'quickAdd' },
  { start: 145, end: 178, target: 'addTile' },
  { start: 196, end: 218, target: 'name' },
  { start: 252, end: 272, target: 'logo' },
  ...(isBrandSearchEnabled ? [{ start: 306, end: 327, target: 'brand' }] : []),
  { start: 342, end: 368, target: 'create' },
];

const CLICKS = [
  F.openServices,
  F.quickAdd,
  F.openForm,
  F.nameClick,
  ...(isBrandSearchEnabled ? [F.logoClick, F.logoSelect] : []),
  F.create,
];

export const TARGETS: Record<string, TargetFinder> = {
  nav: bySelector(`[data-nav="${SERVICES_ROUTE}"]`),
  quickAdd: byText('button', QUICK_ADD.name),
  addTile: byText('button.border-dashed', 'Agregar servicio'),
  name: bySelector('input#name'),
  logo: bySelector('input#iconUrl'),
  brand: byText('button', BRAND.domain),
  create: bySelector('.ant-modal-footer .ant-btn-primary, .ant-drawer-footer .ant-btn-primary'),
};

export const CAPTIONS = [
  { from: 0, step: 1, text: 'Todo empieza por los servicios que vendes' },
  { from: F.showServices, step: 2, text: 'Los más vendidos se agregan con un toque' },
  { from: 140, step: 3, text: '¿Vendes otro? Usa «Agregar servicio»' },
  { from: F.formOpen, step: 4, text: 'Escribe su nombre' },
  {
    from: 248,
    step: 5,
    text: isBrandSearchEnabled
      ? 'Busca su logo y elígelo'
      : 'El logo es opcional: puedes pegar su URL',
  },
  { from: 338, step: 6, text: 'Pulsa Crear y listo' },
];

// Cada subtítulo pausa la escena mientras se presenta a pantalla completa.
export const HOLDS: Hold[] = CAPTIONS.map(c => ({ at: c.from, duration: CAPTION_HOLD }));
export const REAL_CLICKS = CLICKS.map(c => realFrame(c, HOLDS));

export const ADD_SERVICE_DURATION = realDuration(F.end, HOLDS);

// Sonidos: clics, teclas, lo que aparece, las preguntas y el cierre.
export const SOUND_CUES = buildSoundCues(
  {
    clicks: CLICKS,
    typing: [
      { text: NEW_NAME, start: F.nameTyping },
      ...(isBrandSearchEnabled ? [{ text: LOGO_QUERY, start: F.logoTyping }] : []),
    ],
    pops: [
      F.quickAdded,
      F.formOpen,
      ...(isBrandSearchEnabled ? [F.logoResults, F.logoSelect + 1] : []),
      F.created,
    ],
    captions: CAPTIONS.map(c => c.from),
    done: F.done,
  },
  HOLDS,
);
