import { Fragment } from 'react';
import { Badge, Group, Stack, Text } from '@mantine/core';
import { groupApplies, groupInstances, toggleAnchors } from '../lib/strat';
import { useShowStats } from '../lib/statsMode';
import RouteToggles from './RouteToggles';
import StratGroup from './StratGroup';
import RepeatableGroup from './RepeatableGroup';

/**
 * One section of the route.
 *
 * Branch questions are anchored to the first group that depends on them, derived
 * from the groups themselves, so reordering a page moves its questions with it.
 *
 * Groups whose branch wasn't taken are omitted rather than disabled. The walk
 * below still covers the full list, because an anchor can land on a group its
 * own toggle is hiding and the question must stay reachable.
 */
export default function StratPage({
  page,
  total,
  toggleDefs,
  selections,
  toggles,
  instanceCounts,
  onChange,
  onToggleChange,
  onInstancesChange,
}) {
  const showStats = useShowStats();
  const anchors = toggleAnchors(page, toggleDefs);
  const visibleCount = page.groups.filter((group) => groupApplies(group, toggles)).length;

  return (
    <Stack gap="sm" pt="xs">
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" c="dimmed">
          {page.continuesFrom ? `Continues from ${page.continuesFrom}` : `Starts at ${page.base ?? 0}`}
        </Text>
        {showStats && (
          <Badge size="lg" variant="light" color={page.target === 'quistis' ? 'grape' : 'blue'}>
            {total.running} at end of this page
          </Badge>
        )}
      </Group>

      {page.groups.map((group, index) => {
        const anchored = anchors.get(index);
        const shown = groupApplies(group, toggles);
        if (!anchored && !shown) return null;

        return (
          <Fragment key={group.id}>
            {anchored && <RouteToggles toggles={anchored} values={toggles} onChange={onToggleChange} title={null} />}
            {shown &&
              (group.repeatable ? (
                <RepeatableGroup
                  group={group}
                  instances={groupInstances(group, instanceCounts)}
                  selections={selections}
                  onChange={onChange}
                  onInstancesChange={(next) => onInstancesChange(group.id, next)}
                />
              ) : (
                <StratGroup group={group} selections={selections} onChange={onChange} />
              ))}
          </Fragment>
        );
      })}

      {visibleCount === 0 && (
        <Text size="sm" c="dimmed">
          Nothing to log here for the branches you picked.
        </Text>
      )}
    </Stack>
  );
}

