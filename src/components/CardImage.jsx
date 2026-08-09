import { Box } from '@mantine/core';
import { cardArtUrl } from '../lib/cardArt';

/** Every card image is 219x283, so the box matches rather than padding it out. */
const ASPECT = 219 / 283;

/**
 * A card's artwork, or nothing if that card has no image imported.
 *
 * No loading or error state: `cardArtUrl` resolves against files imported at
 * build time, so a card without art renders nothing rather than a gap.
 *
 * `size` is the height; width follows from the shared aspect ratio. `cover`
 * rather than `contain` so a source that ever differs fills the box instead of
 * letterboxing inside it.
 */
export default function CardImage({ card, size = 64 }) {
  const src = cardArtUrl(card);
  if (!src) return null;

  return (
    <Box
      component="img"
      src={src}
      alt=""
      style={{
        width: Math.round(size * ASPECT),
        height: size,
        objectFit: 'cover',
        flexShrink: 0,
        borderRadius: 'var(--mantine-radius-xs)',
      }}
    />
  );
}

