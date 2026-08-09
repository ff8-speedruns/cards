import { Divider, Text } from '@mantine/core';
import CounterField from './CounterField';
import ChoiceField from './ChoiceField';
import ChoiceSelectField from './ChoiceSelectField';
import MultiChoiceField from './MultiChoiceField';
import RepeatField from './RepeatField';

const RADIO_LIMIT = 4;

/** Picks the right control for a normalized strat field. */
export default function StratField({ field, value, onChange }) {
  switch (field.kind) {
    case 'counter':
      return <CounterField field={field} value={value} onChange={onChange} />;
    case 'choice':
      return field.options.length > RADIO_LIMIT ? (
        <ChoiceSelectField field={field} value={value} onChange={onChange} />
      ) : (
        <ChoiceField field={field} value={value} onChange={onChange} />
      );
    case 'multiChoice':
      return <MultiChoiceField field={field} value={value} onChange={onChange} />;
    case 'repeat':
      return <RepeatField field={field} value={value} onChange={onChange} />;
    case 'note':
    default: {
      // The legacy format used decorative labels ("____", " ") purely to break
      // up long lists, so those render as a rule rather than as text.
      //
      // The hyphen stays escaped and the dashes sit at the end: put one either
      // side of another and the class reads as a range and fails to parse.
      const decorative = field.label === '' || /^[\s_=\-–—]*$/.test(field.label);
      return decorative ? (
        <Divider my={2} />
      ) : (
        <Text size="xs" c="dimmed" fs="italic">
          {field.label}
        </Text>
      );
    }
  }
}

