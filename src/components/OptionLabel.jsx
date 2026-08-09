import { Text } from '@mantine/core';
import { signed } from '../lib/format';
import { useShowStats } from '../lib/statsMode';

/** An option's name, with its RNG cost alongside when stats are on. */
export default function OptionLabel({ option }) {
  const showStats = useShowStats();

  return (
    <Text size="sm" component="span">
      {option.label}
      {showStats && (
        <>
          {' '}
          <Text component="span" size="xs" c="dimmed">
            ({signed(option.value)})
          </Text>
        </>
      )}
    </Text>
  );
}

