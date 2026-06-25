import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  GardenElement,
  Run,
  RUN_TYPE_META,
} from '../models/run.model';
import { parseISODate, startOfDay, toISODate, weekKey } from '../utils/date.utils';
import { round1 } from '../utils/number.utils';
import { createId } from '../utils/id.utils';
import { buildDemoRuns } from '../utils/demo-data';
import { LocalStorageService } from './local-storage.service';

const RUNS_KEY = 'run-and-grow.runs';
const SETTINGS_KEY = 'run-and-grow.settings';
const ELEMENTS_PER_LEVEL = 5;

export interface RaceStatus {
  days: number;
  label: string;
  past: boolean;
}

/**
 * Single source of truth for the whole app.
 *
 * Raw state (runs + settings) lives in two signals and is persisted to
 * localStorage via effects. Everything else — weekly stats, streak, the whole
 * garden — is *derived* with `computed()`, so the UI updates instantly and we
 * never store duplicated/ stale data.
 */
@Injectable({ providedIn: 'root' })
export class RunStoreService {
  private readonly storage = inject(LocalStorageService);

  private readonly _runs = signal<Run[]>(this.storage.get<Run[]>(RUNS_KEY, []));
  private readonly _settings = signal<AppSettings>({
    ...DEFAULT_SETTINGS,
    ...this.storage.get<Partial<AppSettings>>(SETTINGS_KEY, {}),
  });

  /** Read-only views of the raw state. */
  readonly runs = this._runs.asReadonly();
  readonly settings = this._settings.asReadonly();

  /** All runs, newest first (by date, then creation time). */
  readonly sortedRuns = computed(() => [...this._runs()].sort((a, b) => this.compareNewestFirst(a, b)));

  readonly weeklyGoalKm = computed(() => this._settings().weeklyGoalKm);

  /** Runs that fall into the *current* (Monday-based) week. */
  readonly currentWeekRuns = computed(() => {
    const currentWeek = weekKey(new Date());
    return this._runs().filter((run) => weekKey(parseISODate(run.date)) === currentWeek);
  });

  readonly weeklyKm = computed(() =>
    round1(this.currentWeekRuns().reduce((sum, run) => sum + run.distanceKm, 0)),
  );

  readonly runsThisWeek = computed(() => this.currentWeekRuns().length);

  readonly weeklyProgress = computed(() => {
    const goal = this.weeklyGoalKm();
    if (goal <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.weeklyKm() / goal) * 100));
  });

  readonly goalReached = computed(() => this.weeklyGoalKm() > 0 && this.weeklyKm() >= this.weeklyGoalKm());

  readonly longestRun = computed(() =>
    round1(this._runs().reduce((max, run) => Math.max(max, run.distanceKm), 0)),
  );

  readonly totalKm = computed(() => round1(this._runs().reduce((sum, run) => sum + run.distanceKm, 0)));

  /** Consecutive calendar days (ending today or yesterday) that contain a run. */
  readonly streak = computed(() => this.computeStreak(this._runs()));

  /** Days until the race, or `null` when no race date is set. */
  readonly daysUntilRace = computed(() => {
    const raceDate = this._settings().raceDate;
    if (!raceDate) {
      return null;
    }
    const today = startOfDay(new Date()).getTime();
    const race = startOfDay(parseISODate(raceDate)).getTime();
    return Math.round((race - today) / 86_400_000);
  });

  readonly raceStatus = computed<RaceStatus | null>(() => {
    const days = this.daysUntilRace();
    if (days === null) {
      return null;
    }
    if (days > 0) {
      return { days, label: `noch ${days} ${days === 1 ? 'Tag' : 'Tage'}`, past: false };
    }
    if (days === 0) {
      return { days, label: 'Heute ist Renntag! 🏁', past: false };
    }
    return { days, label: 'Rennen absolviert 🎉', past: true };
  });

  /** The garden, fully derived from the stored runs + settings. */
  readonly gardenElements = computed<GardenElement[]>(() =>
    this.buildGarden(this._runs(), this._settings()),
  );

  readonly gardenCount = computed(() => this.gardenElements().length);
  readonly gardenLevel = computed(() => Math.floor(this.gardenElements().length / ELEMENTS_PER_LEVEL) + 1);
  readonly elementsToNextLevel = computed(
    () => ELEMENTS_PER_LEVEL - (this.gardenElements().length % ELEMENTS_PER_LEVEL),
  );

  constructor() {
    // Persist whenever state changes.
    effect(() => this.storage.set(RUNS_KEY, this._runs()));
    effect(() => this.storage.set(SETTINGS_KEY, this._settings()));
  }

  // --- Mutations -----------------------------------------------------------

  addRun(input: Omit<Run, 'id' | 'createdAt'>): Run {
    const run: Run = { ...input, id: createId(), createdAt: new Date().toISOString() };
    this._runs.update((runs) => [run, ...runs]);
    return run;
  }

  deleteRun(id: string): void {
    this._runs.update((runs) => runs.filter((run) => run.id !== id));
  }

  setWeeklyGoal(km: number): void {
    if (!Number.isFinite(km) || km <= 0) {
      return;
    }
    this._settings.update((settings) => ({ ...settings, weeklyGoalKm: Math.round(km) }));
  }

  setRaceDate(date: string | null): void {
    this._settings.update((settings) => ({ ...settings, raceDate: date && date.length ? date : null }));
  }

  addDemoData(): void {
    this._runs.update((runs) => [...buildDemoRuns(), ...runs]);
  }

  resetAll(): void {
    this._runs.set([]);
    this._settings.set({ ...DEFAULT_SETTINGS });
  }

  /** Distinct training days within the current week (used for the bird reward). */
  distinctWeekDays(): number {
    return new Set(this.currentWeekRuns().map((run) => run.date)).size;
  }

  // --- Derived logic helpers ----------------------------------------------

  private compareNewestFirst(a: Run, b: Run): number {
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  }

  private computeStreak(runs: Run[]): number {
    if (runs.length === 0) {
      return 0;
    }
    const days = new Set(runs.map((run) => run.date));
    const cursor = startOfDay(new Date());

    // Allow the streak to still "count" if today has no run yet but yesterday did.
    if (!days.has(toISODate(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!days.has(toISODate(cursor))) {
        return 0;
      }
    }

    let streak = 0;
    while (days.has(toISODate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  private buildGarden(runs: Run[], settings: AppSettings): GardenElement[] {
    // Oldest first so the garden visually "grows" over time.
    const chronological = [...runs].sort((a, b) => this.compareNewestFirst(b, a));
    const elements: GardenElement[] = [];

    // One plant per run, based on its type.
    for (const run of chronological) {
      const meta = RUN_TYPE_META[run.type];
      elements.push({
        id: `run-${run.id}`,
        emoji: meta.gardenEmoji,
        label: meta.gardenLabel,
        kind: run.type,
        sourceRunId: run.id,
      });
    }

    // Weekly bonuses.
    const byWeek = new Map<string, Run[]>();
    for (const run of chronological) {
      const key = weekKey(parseISODate(run.date));
      const bucket = byWeek.get(key) ?? [];
      bucket.push(run);
      byWeek.set(key, bucket);
    }

    const goal = settings.weeklyGoalKm;
    for (const [key, weekRuns] of byWeek) {
      const km = weekRuns.reduce((sum, run) => sum + run.distanceKm, 0);
      if (goal > 0 && km >= goal) {
        elements.push({
          id: `butterfly-${key}`,
          emoji: '🦋',
          label: 'Wochenziel erreicht',
          kind: 'butterfly',
          weekKey: key,
        });
      }
      const trainingDays = new Set(weekRuns.map((run) => run.date)).size;
      if (trainingDays >= 3) {
        elements.push({
          id: `bird-${key}`,
          emoji: '🐦',
          label: '3+ Trainingstage',
          kind: 'bird',
          weekKey: key,
        });
      }
    }

    return elements;
  }
}
