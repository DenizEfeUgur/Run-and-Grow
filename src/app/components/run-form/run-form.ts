import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RunStoreService } from '../../services/run-store.service';
import { FEELING_META, Feeling, RUN_TYPE_META, RunType } from '../../models/run.model';
import { toISODate } from '../../utils/date.utils';
import { PacePipe } from '../../pipes/pace.pipe';

interface Reward {
  emoji: string;
  text: string;
}

@Component({
  selector: 'app-run-form',
  imports: [ReactiveFormsModule, RouterLink, PacePipe],
  templateUrl: './run-form.html',
  styleUrl: './run-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunFormComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(RunStoreService);

  protected readonly runTypes = (Object.keys(RUN_TYPE_META) as RunType[]).map((value) => ({
    value,
    ...RUN_TYPE_META[value],
  }));
  protected readonly feelings = (Object.keys(FEELING_META) as Feeling[]).map((value) => ({
    value,
    ...FEELING_META[value],
  }));

  protected readonly submitted = signal(false);
  protected readonly rewards = signal<Reward[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    date: [toISODate(new Date()), Validators.required],
    distanceKm: this.fb.nonNullable.control<number | null>(null, [
      Validators.required,
      Validators.min(0.1),
    ]),
    durationMinutes: this.fb.nonNullable.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    type: ['easy' as RunType, Validators.required],
    feeling: ['good' as Feeling, Validators.required],
    note: [''],
  });

  protected setType(type: RunType): void {
    this.form.controls.type.setValue(type);
  }

  protected setFeeling(feeling: Feeling): void {
    this.form.controls.feeling.setValue(feeling);
  }

  protected invalid(name: 'date' | 'distanceKm' | 'durationMinutes'): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  protected submit(): void {
    // Guard: never save an invalid run (e.g. missing/negative distance or duration).
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const weekDaysBefore = this.store.distinctWeekDays();
    const goalReachedBefore = this.store.goalReached();

    this.store.addRun({
      date: value.date,
      distanceKm: Number(value.distanceKm),
      durationMinutes: Number(value.durationMinutes),
      type: value.type,
      feeling: value.feeling,
      note: value.note.trim() ? value.note.trim() : undefined,
    });

    this.rewards.set(this.collectRewards(value.type, goalReachedBefore, weekDaysBefore));
    this.submitted.set(true);

    // Keep date / type / feeling for quick repeated entry, clear the rest.
    this.form.patchValue({ distanceKm: null, durationMinutes: null, note: '' });
    this.form.controls.distanceKm.markAsUntouched();
    this.form.controls.durationMinutes.markAsUntouched();
    this.form.markAsPristine();
  }

  protected dismiss(): void {
    this.submitted.set(false);
    this.rewards.set([]);
  }

  private collectRewards(type: RunType, goalReachedBefore: boolean, weekDaysBefore: number): Reward[] {
    const meta = RUN_TYPE_META[type];
    const rewards: Reward[] = [{ emoji: meta.gardenEmoji, text: `${meta.gardenLabel} gepflanzt` }];

    if (!goalReachedBefore && this.store.goalReached()) {
      rewards.push({ emoji: '🦋', text: 'Wochenziel erreicht – ein Schmetterling erscheint!' });
    }
    if (weekDaysBefore < 3 && this.store.distinctWeekDays() >= 3) {
      rewards.push({ emoji: '🐦', text: '3 Trainingstage – ein Vogel zieht ein!' });
    }
    return rewards;
  }
}
