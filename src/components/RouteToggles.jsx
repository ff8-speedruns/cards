import { Paper, SegmentedControl, SimpleGrid, Stack, Switch, Text } from '@mantine/core';

/** A `title` of null renders the toggles with no heading, for inline use. */
export default function RouteToggles({ toggles, values, onChange, title = 'Which way did the run go?' }) {
  if (toggles.length === 0) return null;

  return (
    <Paper withBorder radius="md" p="md">
      {title && (
        <Text fw={600} size="sm" mb="sm">
          {title}
        </Text>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {toggles.map((toggle) =>
          toggle.kind === 'select' ? (
            <Stack key={toggle.id} gap={4}>
              <Text size="sm">{toggle.label}</Text>
              {toggle.description && (
                <Text size="xs" c="dimmed">
                  {toggle.description}
                </Text>
              )}
              <SegmentedControl
                size="xs"
                data={toggle.options}
                value={String(values[toggle.id] ?? toggle.default)}
                onChange={(next) => onChange(toggle.id, next)}
              />
            </Stack>
          ) : (
            <Switch
              key={toggle.id}
              label={toggle.label}
              description={toggle.description ?? undefined}
              checked={Boolean(values[toggle.id])}
              onChange={(event) => onChange(toggle.id, event.currentTarget.checked)}
            />
          )
        )}
      </SimpleGrid>
    </Paper>
  );
}

