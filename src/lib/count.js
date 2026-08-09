/**
 * Turns the runner's answers into RNG counts.
 *
 * Note that strat files store numbers as strings in places, so everything here
 * coerces before adding rather than trusting the input.
 */
import { groupApplies, groupInstances, instanceFieldId } from './strat';

const blank = (value) => value == null || value === '';

/**
 * Option fields store the chosen option's *index*, not its value: values repeat
 * within a group, so a value can't identify which option was picked.
 */
const optionValue = (field, index) => {
  const i = Number(index);
  return Number.isInteger(i) && i >= 0 && i < field.options.length ? field.options[i].value : 0;
};

const sumOptions = (field, selection) =>
  Array.isArray(selection)
    ? selection.reduce((sum, index) => (blank(index) ? sum : sum + optionValue(field, index)), 0)
    : 0;

/** What one field contributes. */
function fieldValue(field, selection) {
  switch (field.kind) {
    case 'fixed':
      return field.value;
    case 'counter': {
      const count = Number(selection ?? 0);
      return Number.isFinite(count) ? field.each * count : 0;
    }
    case 'choice':
      return blank(selection) ? 0 : optionValue(field, selection);
    // multiChoice holds every index ticked; repeat holds one per repetition.
    case 'multiChoice':
    case 'repeat':
      return sumOptions(field, selection);
    default:
      return 0;
  }
}

/** What a page contributes by itself, ignoring any page it continues from. */
function pageSubtotal(page, selections, toggles, instanceCounts) {
  let total = page.base ?? 0;
  for (const group of page.groups) {
    if (!groupApplies(group, toggles)) continue;
    for (let instance = 0; instance < groupInstances(group, instanceCounts); instance++) {
      for (const field of group.fields) {
        total += fieldValue(field, selections[instanceFieldId(field.id, instance)]);
      }
    }
  }
  return total;
}

/**
 * Per-page and per-card totals.
 *
 * `running` follows `continuesFrom` back to the page carrying the base, so you
 * can check your count partway through a run. The card totals add each page once
 * instead, since following the chain there would double-count a shared base.
 */
export function countStrat(strat, selections, { extraQuistis = 0, extraZell = 0, toggles = {}, instanceCounts = {} } = {}) {
  const own = new Map(strat.pages.map((page) => [page.id, pageSubtotal(page, selections, toggles, instanceCounts)]));
  const byLabel = new Map(strat.pages.map((page) => [page.label, page]));

  // `seen` guards against a hand-written file pointing two pages at each other.
  const running = (page, seen = new Set()) => {
    if (seen.has(page.id)) return 0;
    seen.add(page.id);
    const parent = page.continuesFrom ? byLabel.get(page.continuesFrom) : null;
    return own.get(page.id) + (parent && parent.id !== page.id ? running(parent, seen) : 0);
  };

  const pages = strat.pages.map((page) => ({
    id: page.id,
    label: page.label,
    target: page.target,
    own: own.get(page.id),
    running: running(page),
  }));

  const totalFor = (target) => pages.filter((p) => p.target === target).reduce((sum, p) => sum + p.own, 0);

  return {
    pages,
    quistis: totalFor('quistis') + extraQuistis,
    zell: totalFor('zell') + extraZell,
  };
}
