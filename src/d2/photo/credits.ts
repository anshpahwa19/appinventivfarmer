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
}

export const CREDITS: Record<string, PhotoCredit> = {};
