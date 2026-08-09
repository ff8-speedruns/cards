import { ActionIcon, Group, NumberInput, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { signed } from '../lib/format';
import { useShowStats } from '../lib/statsMode';

export default function CounterField({ field, value, onChange }) {
  const showStats = useShowStats();
  const count = Number(value ?? 0);

  // An updater rather than `count + 1`: quick taps batch into one render, and
  // each would otherwise read the same stale count.
  const bump = (delta) => onChange(field.id, (previous) => Math.max(0, (Number(previous) || 0) + delta));

  const set = (next) => onChange(field.id, Math.max(0, Number.isFinite(next) ? next : 0));

  return (
    <Group justify="space-between" wrap="nowrap" gap="sm">
      <Text size="sm" style={{ flex: 1 }}>
        {field.label || 'Count'}
        {showStats && (
          <Text component="span" size="xs" c="dimmed" ml={6}>
            {signed(field.each)} each
          </Text>
        )}
      </Text>

      <Group gap={4} wrap="nowrap">
        <ActionIcon variant="default" onClick={() => bump(-1)} disabled={count === 0} aria-label={`One fewer ${field.label}`}>
          <IconMinus size={16} />
        </ActionIcon>
        <NumberInput
          value={count}
          onChange={(next) => set(Number(next))}
          min={0}
          hideControls
          size="xs"
          styles={{ input: { width: 52, textAlign: 'center' } }}
          aria-label={field.label || 'Count'}
        />
        <ActionIcon variant="default" onClick={() => bump(1)} aria-label={`One more ${field.label}`}>
          <IconPlus size={16} />
        </ActionIcon>
        {showStats && (
          <Text size="xs" c="dimmed" w={52} ta="right">
            {count === 0 ? '-' : signed(field.each * count)}
          </Text>
        )}
      </Group>
    </Group>
  );
}

