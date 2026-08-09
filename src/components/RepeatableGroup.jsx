import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import StratGroup from './StratGroup';

export default function RepeatableGroup({ group, instances, selections, onChange, onInstancesChange }) {
  const noun = group.repeatLabel ?? 'entry';

  return (
    <Stack gap="xs">
      <Group justify="space-between" wrap="nowrap">
        <Text fw={600} size="sm">
          {group.label}
        </Text>
        <Group gap="xs">
          {instances > 0 && (
            <Button
              size="compact-xs"
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => onInstancesChange(instances - 1)}
            >
              Remove
            </Button>
          )}
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={() => onInstancesChange(instances + 1)}
          >
            Add {noun}
          </Button>
        </Group>
      </Group>

      {instances === 0 ? (
        <Text size="sm" c="dimmed">
          No {noun}s logged. Add one for each you ran into.
        </Text>
      ) : (
        Array.from({ length: instances }, (_, i) => (
          <StratGroup
            key={i}
            group={group}
            instance={i}
            selections={selections}
            onChange={onChange}
            heading={`${noun[0].toUpperCase()}${noun.slice(1)} ${i + 1}`}
          />
        ))
      )}
    </Stack>
  );
}

