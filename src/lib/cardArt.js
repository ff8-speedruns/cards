/**
 * Card artwork, resolved from the card's name.
 *
 * Files are named for the card they show, lowercased with punctuation replaced
 * by hyphens, aka the mapping is derived rather than maintained by hand.
 *
 * Glob is eager, so everything in the directory is bundled: only the cards
 * that can actually appear have a file.
 */
const ART = import.meta.glob('../assets/card-art/*.jpg', { eager: true, query: '?url', import: 'default' });

const fileName = (name) => `../assets/card-art/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;

/** The artwork for a card, or null if it isn't one that can be shown. */
export const cardArtUrl = (card) => (card ? (ART[fileName(card.name)] ?? null) : null);
