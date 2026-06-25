import { Run, RunType, Feeling } from '../models/run.model';
import { toISODate } from './date.utils';
import { createId } from './id.utils';

/**
 * Builds a set of realistic demo runs spanning the last ~2 weeks so the
 * dashboard, garden and history all have something nice to show.
 */
export function buildDemoRuns(): Run[] {
  const today = new Date();

  const make = (
    daysAgo: number,
    distanceKm: number,
    durationMinutes: number,
    type: RunType,
    feeling: Feeling,
    note?: string,
  ): Run => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return {
      id: createId(),
      date: toISODate(date),
      distanceKm,
      durationMinutes,
      type,
      feeling,
      note,
      createdAt: new Date().toISOString(),
    };
  };

  return [
    make(1, 6, 36, 'easy', 'good', 'Lockerer Start in die Woche'),
    make(2, 8, 41, 'tempo', 'strong'),
    make(4, 5, 32, 'recovery', 'tired', 'Beine waren etwas schwer'),
    make(6, 18, 110, 'long', 'good', 'Langer Lauf am Wochenende'),
    make(8, 7, 38, 'intervals', 'strong', '6 × 800 m'),
    make(9, 6, 37, 'easy', 'good'),
    make(11, 10, 55, 'tempo', 'good'),
    make(13, 16, 99, 'long', 'tired'),
  ];
}
