import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a running pace as `m:ss min/km`.
 *
 * Usage: `{{ run.distanceKm | pace: run.durationMinutes }}` → `5:32 min/km`.
 */
@Pipe({ name: 'pace' })
export class PacePipe implements PipeTransform {
  transform(distanceKm: number | null | undefined, durationMinutes: number | null | undefined): string {
    if (!distanceKm || !durationMinutes || distanceKm <= 0 || durationMinutes <= 0) {
      return '–';
    }

    const paceMinutesPerKm = durationMinutes / distanceKm;
    let minutes = Math.floor(paceMinutesPerKm);
    let seconds = Math.round((paceMinutesPerKm - minutes) * 60);

    if (seconds === 60) {
      minutes += 1;
      seconds = 0;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
  }
}
