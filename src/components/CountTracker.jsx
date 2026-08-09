import { useMemo, useState } from 'react';
import { Tabs } from '@mantine/core';
import StratPage from './StratPage';

export default function CountTracker({
  strat,
  totals,
  selections,
  toggles,
  instanceCounts,
  onChange,
  onToggleChange,
  onInstancesChange,
}) {
  const totalsById = useMemo(() => new Map(totals.pages.map((page) => [page.id, page])), [totals]);
  const [active, setActive] = useState(strat.pages[0]?.id ?? null);

  // A different strat file has different page ids, so fall back to its first
  // page rather than rendering an empty tab panel.
  const current = totalsById.has(active) ? active : (strat.pages[0]?.id ?? null);

  return (
    <Tabs value={current} onChange={setActive} variant="outline" keepMounted={false}>
      <Tabs.List>
        {strat.pages.map((page) => (
          <Tabs.Tab key={page.id} value={page.id}>
            {page.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {strat.pages.map((page) => (
        <Tabs.Panel key={page.id} value={page.id}>
          <StratPage
            page={page}
            total={totalsById.get(page.id) ?? { own: 0, running: 0 }}
            toggleDefs={strat.toggles}
            selections={selections}
            toggles={toggles}
            instanceCounts={instanceCounts}
            onChange={onChange}
            onToggleChange={onToggleChange}
            onInstancesChange={onInstancesChange}
          />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

