import { Group, Radio, Text } from '@mantine/core';
import OptionLabel from './OptionLabel';

export default function ChoiceField({ field, value, onChange }) {
  return (
    <Radio.Group
      label={
        <Text size="sm" component="span">
          {field.label || 'Pick one'}
        </Text>
      }
      value={value == null ? null : String(value)}
      onChange={(next) => onChange(field.id, next === null ? null : Number(next))}
    >
      <Group mt={4} gap="md">
        {field.options.map((option, i) => (
          <Radio key={i} value={String(i)} label={<OptionLabel option={option} />} />
        ))}
      </Group>
    </Radio.Group>
  );
}

