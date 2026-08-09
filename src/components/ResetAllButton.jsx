import { useState } from 'react';
import { Button } from '@mantine/core';
import { useTimeout } from '@mantine/hooks';
import { IconRotate2 } from '@tabler/icons-react';

/** How long the armed state sticks around before lapsing back, in ms. */
const ARMED_MS = 4000;

/**
 * Clears a run's tracked counts back to the route's defaults.
 *
 * Two clicks, because there's no undo. The armed state lapses on its own so it
 * can't sit waiting to catch an unrelated click later.
 */
export default function ResetAllButton({ onReset }) {
  const [armed, setArmed] = useState(false);
  const lapse = useTimeout(() => setArmed(false), ARMED_MS);

  const click = () => {
    if (!armed) {
      setArmed(true);
      lapse.start();
      return;
    }
    lapse.clear();
    setArmed(false);
    onReset();
  };

  return (
    <Button
      size="xs"
      variant={armed ? 'filled' : 'default'}
      color={armed ? 'red' : undefined}
      leftSection={<IconRotate2 size={16} />}
      onClick={click}
    >
      {armed ? 'Confirm reset' : 'Reset all'}
    </Button>
  );
}

