import { createContext, useContext } from 'react';

/**
 * Whether to show the raw RNG figures - counts, states, and the per-action
 * amounts beside each answer.
 *
 * A display preference read by leaf controls several levels down, so it travels
 * by context rather than through every component's props. Defaults to off: the
 * numbers are diagnostic, and a run only needs the instruction they produce.
 */
const StatsContext = createContext(false);

export const StatsProvider = StatsContext.Provider;

export const useShowStats = () => useContext(StatsContext);
