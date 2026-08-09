import { Group, NumberInput, Paper, Stack, Text } from '@mantine/core';

export default function CountSummary({ totals, extraQuistis, extraZell, onExtraQuistis, onExtraZell }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" wrap="wrap" gap="lg">
        <Group gap="xl">
          <Stack gap={0}>
            <Text size="xs" c="dimmed" tt="uppercase">
              Quistis count
            </Text>
            <Text fw={700} fz={28} lh={1.1} c="grape.4">
              {totals.quistis}
            </Text>
          </Stack>
          <Stack gap={0}>
            <Text size="xs" c="dimmed" tt="uppercase">
              Zell count
            </Text>
            <Text fw={700} fz={28} lh={1.1} c="blue.4">
              {totals.zell}
            </Text>
          </Stack>
        </Group>

        <Group gap="md" align="flex-end">
          <NumberInput
            label="Quistis offset"
            description="Anything the route missed"
            value={extraQuistis}
            onChange={(v) => onExtraQuistis(Number(v) || 0)}
            size="xs"
            w={130}
          />
          <NumberInput
            label="Zell offset"
            description="Anything the route missed"
            value={extraZell}
            onChange={(v) => onExtraZell(Number(v) || 0)}
            size="xs"
            w={130}
          />
        </Group>
      </Group>
    </Paper>
  );
}

