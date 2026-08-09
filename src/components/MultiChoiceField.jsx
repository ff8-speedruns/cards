import { Checkbox, Group, Text } from '@mantine/core';
import OptionLabel from './OptionLabel';

export default function MultiChoiceField({ field, value, onChange }) {
  return (
    <Checkbox.Group
      label={
        <Text size="sm" component="span">
          {field.label || 'Any that apply'}
        </Text>
      }
      value={Array.isArray(value) ? value.map(String) : []}
      onChange={(next) => onChange(field.id, next.map(Number))}
    >
      <Group mt={4} gap="md">
        {field.options.map((option, i) => (
          <Checkbox key={i} value={String(i)} label={<OptionLabel option={option} />} />
        ))}
      </Group>
    </Checkbox.Group>
  );
}

