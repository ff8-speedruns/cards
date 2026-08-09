import { Box, Tooltip } from '@mantine/core';

/**
 * The next stretch of frames as a bar, filled where the rare card would be in
 * the opponent's deck.
 *
 * `leadIn` prepends that many ticks of hatched dead space for the screen
 * transition after accepting the game, during which no frame is reachable.
 *
 * It's one flex-weighted block rather than `leadIn` separate ones: every notch
 * is `flex: 1`, so a block of `flex: leadIn` occupies exactly `leadIn` notches
 * of width, and frame `i` lands at `(leadIn + i) / total` - the same figure the
 * playhead uses.
 *
 * `nowTick` is in that same combined space - elapsed ticks since Start, not a
 * frame index. Fractional values are expected and animate more smoothly.
 *
 * The notches must have no `gap` and no `minWidth`: either pins the row to a
 * fixed width regardless of the container, and the playhead is positioned as a
 * percentage of the container, so the two stop lining up.
 */
export default function FrameStrip({ frames, first, nowTick = null, leadIn = 0 }) {
  const total = leadIn + frames.length;
  const showMarker = nowTick !== null && nowTick >= 0 && nowTick <= total;

  return (
    <Tooltip
      label={
        `Each notch is one frame. Filled = the card is in their deck. First run starts at frame ${first}.` +
        (leadIn > 0 ? ` The hatched stretch at the left is the ${leadIn}-frame screen transition after accepting.` : '')
      }
      multiline
      w={260}
    >
      <Box
        style={{
          position: 'relative',
          display: 'flex',
          height: 28,
          alignItems: 'stretch',
          borderRadius: 'var(--mantine-radius-sm)',
          overflow: 'hidden',
        }}
      >
        {leadIn > 0 && (
          <Box
            style={{
              flex: leadIn,
              background:
                'repeating-linear-gradient(45deg, var(--mantine-color-dark-6) 0 4px, var(--mantine-color-dark-5) 4px 8px)',
            }}
          />
        )}
        {frames.map((available, i) => (
          <Box
            key={i}
            style={{
              flex: 1,
              background: available
                ? i === first
                  ? 'var(--mantine-color-lime-4)'
                  : 'var(--mantine-color-teal-6)'
                : 'var(--mantine-color-dark-4)',
            }}
          />
        ))}
        {showMarker && (
          <Box
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(nowTick / total) * 100}%`,
              width: 2,
              marginLeft: -1,
              background: 'var(--mantine-color-white)',
              boxShadow: '0 0 4px rgba(0, 0, 0, 0.7)',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}

