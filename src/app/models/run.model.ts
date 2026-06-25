/**
 * Core domain types for Run & Grow.
 *
 * Garden elements are *derived* from the stored runs (see RunStoreService),
 * so they never need to be persisted separately.
 */

export type RunType = 'easy' | 'intervals' | 'tempo' | 'long' | 'recovery';
export type Feeling = 'tired' | 'good' | 'strong';

export interface Run {
  id: string;
  /** Local calendar date in `YYYY-MM-DD` format. */
  date: string;
  distanceKm: number;
  durationMinutes: number;
  type: RunType;
  feeling: Feeling;
  note?: string;
  /** ISO timestamp of when the entry was created. */
  createdAt: string;
}

export interface AppSettings {
  weeklyGoalKm: number;
  /** `YYYY-MM-DD` of the half-marathon, or `null` when not set yet. */
  raceDate: string | null;
}

/** Every kind of plant/animal that can grow in the garden. */
export type GardenKind = RunType | 'butterfly' | 'bird';

export interface GardenElement {
  id: string;
  emoji: string;
  label: string;
  kind: GardenKind;
  /** The run that produced this element (for per-run plants). */
  sourceRunId?: string;
  /** The week (Monday key) this element belongs to (for weekly bonuses). */
  weekKey?: string;
}

/** Display metadata + garden reward for each training type. */
export const RUN_TYPE_META: Record<
  RunType,
  { label: string; short: string; gardenEmoji: string; gardenLabel: string }
> = {
  easy: { label: 'Lockerer Lauf', short: 'Locker', gardenEmoji: '🌷', gardenLabel: 'Blume' },
  intervals: { label: 'Intervalle', short: 'Intervalle', gardenEmoji: '🌿', gardenLabel: 'Strauch' },
  tempo: { label: 'Tempolauf', short: 'Tempo', gardenEmoji: '🌺', gardenLabel: 'Besondere Blume' },
  long: { label: 'Long Run', short: 'Long Run', gardenEmoji: '🌳', gardenLabel: 'Baum' },
  recovery: { label: 'Regeneration', short: 'Regen.', gardenEmoji: '🍄', gardenLabel: 'Pilz' },
};

/** Display metadata for the "feeling" after a run. */
export const FEELING_META: Record<Feeling, { label: string; emoji: string }> = {
  tired: { label: 'Müde', emoji: '😫' },
  good: { label: 'Gut', emoji: '🙂' },
  strong: { label: 'Stark', emoji: '🔥' },
};

export const DEFAULT_SETTINGS: AppSettings = {
  weeklyGoalKm: 25,
  raceDate: null,
};
