import { Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { optionText } from '../lib/format';
import { useShowStats } from '../lib/statsMode';

export default function RepeatField({ field, value, onChange }) {
  const showStats = useShowStats();
  const selections = Array.isArray(value) ? value : [];

  // Built from the previous answer, so two changes in one render can't drop one.
  const setAt = (index, next) =>
    onChange(field.id, (previous) => {
      const updated = Array.from({ length: field.count }, (_, i) => (Array.isArray(previous) ? previous[i] : null) ?? null);
      updated[index] = next == null || next === '' ? null : Number(next);
      return updated;
    });

  const data = field.options.map((option, i) => ({ value: String(i), label: showStats ? optionText(option) : option.label }));

  return (
    <Stack gap={4}>
      {field.label && <Text size="sm">{field.label}</Text>}
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="xs">
        {Array.from({ length: field.count }, (_, i) => (
          <Select
            key={i}
            size="xs"
            placeholder={`#${i + 1}`}
            data={data}
            value={selections[i] == null ? null : String(selections[i])}
            onChange={(next) => setAt(i, next)}
            clearable
            aria-label={`${field.label || 'Encounter'} ${i + 1}`}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

