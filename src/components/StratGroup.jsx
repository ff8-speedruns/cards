import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { instanceFieldId } from '../lib/strat';
import { signed } from '../lib/format';
import { useShowStats } from '../lib/statsMode';
import StratField from './StratField';

/**
 * One encounter from the route, with every question it asks.
 *
 * `fixed` fields have nothing to answer, so they're rolled into one figure in the
 * header rather than listed as dead rows - the form stays to what you log, while
 * still showing where the baseline came from.
 */
export default function StratGroup({ group, instance = 0, selections, onChange, heading }) {
  const showStats = useShowStats();
  const fixed = group.fields.filter((field) => field.kind === 'fixed').reduce((sum, field) => sum + field.value, 0);
  const answerable = group.fields.filter((field) => field.kind !== 'fixed');

  return (
    <Paper withBorder radius="md" p="sm">
      <Group justify="space-between" wrap="nowrap" mb={answerable.length > 0 ? 'xs' : 0}>
        {(heading ?? group.label) && (
          <Text fw={600} size="sm">
            {heading ?? group.label}
          </Text>
        )}
        {showStats && fixed !== 0 && (
          <Badge size="sm" variant="light" color="gray" radius="sm" tt="none">
            {signed(fixed)} before any actions
          </Badge>
        )}
      </Group>

      <Stack gap="xs">
        {answerable.map((field) => {
          const id = instanceFieldId(field.id, instance);
          return <StratField key={id} field={{ ...field, id }} value={selections[id]} onChange={onChange} />;
        })}
      </Stack>
    </Paper>
  );
}

