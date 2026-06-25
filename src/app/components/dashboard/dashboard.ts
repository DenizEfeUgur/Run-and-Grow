import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RunStoreService } from '../../services/run-store.service';
import { round1 } from '../../utils/number.utils';
import { formatHumanDate } from '../../utils/date.utils';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly store = inject(RunStoreService);
  protected readonly formatDate = formatHumanDate;

  /** A short, context-aware motivational line. */
  protected readonly motivation = computed(() => {
    if (this.store.runs().length === 0) {
      return 'Jeder Halbmarathon beginnt mit dem ersten Schritt. Trage dein erstes Training ein!';
    }
    if (this.store.goalReached()) {
      return 'Stark! Du hast dein Wochenziel schon erreicht. 🎉';
    }
    const remaining = round1(Math.max(0, this.store.weeklyGoalKm() - this.store.weeklyKm()));
    return `Noch ${remaining} km bis zu deinem Wochenziel. Bleib dran! 💪`;
  });

  /** Most recent garden elements for the small preview row. */
  protected readonly gardenPreview = computed(() => this.store.gardenElements().slice(-7).reverse());

  protected onRaceDateChange(value: string): void {
    this.store.setRaceDate(value || null);
  }
}
