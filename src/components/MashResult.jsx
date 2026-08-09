import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { CARD_BY_ID } from '../lib/cardTable';
import { secondsUntilFrame } from '../lib/cardRng';
import { useShowStats } from '../lib/statsMode';
import Timer from './Timer';

/**
 * Below this the wait is short enough to be tight rather than comfortable, so the
 * badge warns the player.
 */
const TIGHT_WAIT_FRAMES = 85;

/**
 * Whether to mash straight away, and if not, how long to wait. `count` is
 * omitted when the state is known outright rather than counted up to.
 */
export default function MashResult({ label, count, result, color, platform, hotkey }) {
  const showStats = useShowStats();
  const { frame, window, deck, state } = result;
  // Not `frame / 60` - the platform's screen transition has to pass first.
  const seconds = secondsUntilFrame(frame, platform);
  const instant = seconds === 0;

  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
        <Stack gap={0}>
          <Text fw={600}>{label}</Text>
          {showStats && (
            <Text size="xs" c="dimmed">
              {count === undefined ? '' : `RNG count ${count} · `}state {state.toString(16).padStart(8, '0')}
            </Text>
          )}
        </Stack>
        <Badge size="lg" color={instant ? 'red' : frame <= TIGHT_WAIT_FRAMES ? 'orange' : color} variant="filled">
          {instant ? 'Mash immediately' : `Wait ${seconds.toFixed(2)}s`}
        </Badge>
      </Group>

      <Group gap="xl" mb="sm">
        <Stack gap={0}>
          <Text size="xs" c="dimmed" tt="uppercase">
            First frame
          </Text>
          <Text fw={600}>{frame}</Text>
        </Stack>
        <Stack gap={0}>
          <Text size="xs" c="dimmed" tt="uppercase">
            Window
          </Text>
          <Text fw={600}>
            {window} frame{window === 1 ? '' : 's'}
          </Text>
        </Stack>
        <Stack gap={0}>
          <Text size="xs" c="dimmed" tt="uppercase">
            Goes first
          </Text>
          <Text fw={600}>{deck.playerGoesFirst ? 'You' : 'Them'}</Text>
        </Stack>
      </Group>

      {/* Keyed on platform so switching console remounts, closing the audio
          context and cancelling beeps scheduled against the old delay. */}
      <Timer key={platform} frames={result.frames} platform={platform} hotkey={hotkey} />

      <Text size="xs" c="dimmed" mt="sm" tt="uppercase">
        Their deck on that frame
      </Text>
      <Group gap={6} mt={4}>
        {deck.deck.map((id) => {
          const card = CARD_BY_ID.get(id);
          return (
            <Badge key={id} variant={card?.isRare ? 'filled' : 'light'} color={card?.isRare ? color : 'gray'} radius="sm" tt="none">
              {card ? card.name : `#${id}`}
            </Badge>
          );
        })}
      </Group>
    </Paper>
  );
}

