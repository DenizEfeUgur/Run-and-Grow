import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RunStoreService } from '../../services/run-store.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  protected readonly store = inject(RunStoreService);
  protected readonly confirmReset = signal(false);
  protected readonly toast = signal<string | null>(null);

  protected onGoalChange(value: string): void {
    const km = Number(value);
    if (Number.isFinite(km) && km > 0) {
      this.store.setWeeklyGoal(km);
      this.flash('Wochenziel aktualisiert');
    }
  }

  protected onRaceChange(value: string): void {
    this.store.setRaceDate(value || null);
    this.flash(value ? 'Renndatum gespeichert' : 'Renndatum entfernt');
  }

  protected addDemo(): void {
    this.store.addDemoData();
    this.flash('Demo-Daten hinzugefügt 🌱');
  }

  protected requestReset(): void {
    this.confirmReset.set(true);
  }

  protected cancelReset(): void {
    this.confirmReset.set(false);
  }

  protected doReset(): void {
    this.store.resetAll();
    this.confirmReset.set(false);
    this.flash('Alle Daten zurückgesetzt');
  }

  private flash(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 2500);
  }
}
