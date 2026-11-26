import { MINUTES_PER_DAY, POLITICS } from './config';
import type { Broadcast, SimState } from './types';

/** Years are counted from the first displayed day, using the simulation's political calendar. */
export function simulationYear(tick: number): number {
  return 1 + Math.floor(tick / (MINUTES_PER_DAY * POLITICS.year));
}

export type TvEra = 'none' | 'monochrome' | 'color' | 'cable';

export function tvEra(tick: number): TvEra {
  const year = simulationYear(tick);
  if (year < 2) return 'none';
  if (year === 2) return 'monochrome';
  if (year === 3) return 'color';
  return 'cable';
}

export function tvAvailable(tick: number): boolean {
  return tvEra(tick) !== 'none';
}

/** Regional programs can reach the city once a resident owns a set or a local channel opens. */
export function hasTvReception(state: Pick<SimState, 'tick' | 'people' | 'firms'>): boolean {
  return tvAvailable(state.tick) && (
    state.people.some((p) => (p.durables.tv ?? 0) > 0) ||
    state.firms.some((f) => !!f.channel && !f.closed)
  );
}

type Schedule = Readonly<Partial<Record<number, { show: string; kind: Broadcast['kind'] }>>>;

const monochrome: Schedule = {
  7: { show: 'Morning News', kind: 'news' },
  18: { show: 'Evening News', kind: 'news' },
  20: { show: 'Talk of the City', kind: 'talk' },
};

const color: Schedule = {
  ...monochrome,
  8: { show: 'Good Morning City', kind: 'talk' },
  12: { show: 'Noon Report', kind: 'news' },
  21: { show: 'Prime Time Drama', kind: 'entertainment' },
};

const cable: Schedule = {
  ...color,
  13: { show: 'Afternoon Matinee', kind: 'entertainment' },
  19: { show: 'The Business Hour', kind: 'talk' },
  22: { show: 'Late News', kind: 'news' },
};

export const tvSchedules: Readonly<Record<TvEra, Schedule>> = { none: {}, monochrome, color, cable };
