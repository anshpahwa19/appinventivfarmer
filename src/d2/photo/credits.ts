/**
 * Credits for photographs placed in ./files. One entry per slot id.
 * Every photo shown in Direction 02 must have an entry here: the About
 * screen flags any file without one.
 *
 * Example:
 *   'harvest-baler': {
 *     author: 'Name Surname',
 *     source: 'Wikimedia Commons',
 *     url: 'https://commons.wikimedia.org/wiki/File:…',
 *     licence: 'CC BY-SA 4.0',
 *   },
 */
export interface PhotoCredit {
  author: string;
  source: string;
  url?: string;
  licence: string;
  /** AI-generated concept images are placeholders and must be replaced before launch. */
  ai?: boolean;
}

/*
 * The bundled images are AI-generated concept photographs (Figma AI,
 * gpt-image-2.5-flare, November 2026), made for the design review because
 * licensed photography could not be fetched in the build environment. They
 * do not show real people or places. Replace each with a licensed or
 * commissioned photo before launch; see docs/photo-shot-list.md.
 */
const AI: PhotoCredit = { author: 'AI-generated concept image', source: 'Figma AI (gpt-image-2.5-flare)', licence: 'For design review only; replace before launch', ai: true };

export const CREDITS: Record<string, PhotoCredit> = Object.fromEntries(
  [
    'harvest-baler', 'harvest-bales', 'harvest-hands', 'paddy-transplant', 'paddy-closeup', 'paddy-field', 'wheat-field', 'wheat-grain',
    'mustard-field', 'cotton-picking', 'cotton-drip', 'soil-sample', 'soil-texture', 'village-meeting', 'village-delivery', 'workshop-demo',
    'canal-irrigation', 'monsoon-sky', 'fom-product', 'machinery-tractor', 'farmer-portrait', 'dawn-field',
  ].map((id) => [id, AI]),
);
