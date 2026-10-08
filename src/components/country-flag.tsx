import cn from '@/helpers/cn';

// Banderas SVG 3:2 (country-flag-icons). Solo se guardan sus URLs: cada SVG se
// descarga cuando se muestra. Emojis no: Windows los pinta como letras ("PE").
const FLAG_URLS = import.meta.glob<string>('/node_modules/country-flag-icons/3x2/*.svg', {
  eager: true,
  query: '?no-inline',
  import: 'default',
});

const flagUrl = (code: string) =>
  FLAG_URLS[`/node_modules/country-flag-icons/3x2/${code.toUpperCase()}.svg`];

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

/** Nombre del país en español ("Perú"); el código si no se conoce. */
export const countryName = (code: string) => {
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};

interface CountryFlagProps {
  /** Código ISO 3166-1 alfa-2 (`PE`). */
  code?: string;
  /** Ancho en px (alto 2/3). */
  width?: number;
  className?: string;
}

/** Bandera del país; nada si no hay código o no hay bandera para él. */
export function CountryFlag({ code, width = 18, className }: CountryFlagProps) {
  const src = code ? flagUrl(code) : undefined;
  if (!code || !src) return null;
  const name = countryName(code);
  return (
    <img
      src={src}
      alt={name}
      title={name}
      width={width}
      height={Math.round((width * 2) / 3)}
      loading="lazy"
      className={cn('inline-block shrink-0 rounded-[2px] object-cover', className)}
    />
  );
}
