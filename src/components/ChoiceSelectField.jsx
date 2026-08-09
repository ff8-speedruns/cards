import { Select, Stack, Text } from '@mantine/core';
import { optionText } from '../lib/format';
import { useShowStats } from '../lib/statsMode';

export default function ChoiceSelectField({ field, value, onChange }) {
  const showStats = useShowStats();

  return (
    <Stack gap={4}>
      {field.label && <Text size="sm">{field.label}</Text>}
      <Select
        size="xs"
        placeholder="Pick one"
        data={field.options.map((option, i) => ({ value: String(i), label: showStats ? optionText(option) : option.label }))}
        value={value == null ? null : String(value)}
        onChange={(next) => onChange(field.id, next == null || next === '' ? null : Number(next))}
        clearable
        aria-label={field.label || 'Pick one'}
      />
    </Stack>
  );
}

