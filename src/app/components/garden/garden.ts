import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RunStoreService } from '../../services/run-store.service';
import { RUN_TYPE_META } from '../../models/run.model';

interface LegendEntry {
  emoji: string;
  rule: string;
}

@Component({
  selector: 'app-garden',
  imports: [RouterLink],
  templateUrl: './garden.html',
  styleUrl: './garden.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GardenComponent {
  protected readonly store = inject(RunStoreService);

  /** Newest elements first so recent growth shows up on top. */
  protected readonly elements = computed(() => [...this.store.gardenElements()].reverse());

  /** Progress within the current level (0–100%). */
  protected readonly levelPercent = computed(() => {
    const within = this.store.gardenCount() % 5;
    return Math.round((within / 5) * 100);
  });

  protected readonly legend: LegendEntry[] = [
    { emoji: RUN_TYPE_META.easy.gardenEmoji, rule: 'Lockerer Lauf → Blume' },
    { emoji: RUN_TYPE_META.intervals.gardenEmoji, rule: 'Intervalle → Strauch' },
    { emoji: RUN_TYPE_META.tempo.gardenEmoji, rule: 'Tempolauf → besondere Blume' },
    { emoji: RUN_TYPE_META.long.gardenEmoji, rule: 'Long Run → Baum' },
    { emoji: RUN_TYPE_META.recovery.gardenEmoji, rule: 'Regeneration → Pilz' },
    { emoji: '🦋', rule: 'Wochenziel erreicht → Schmetterling' },
    { emoji: '🐦', rule: '3+ Trainingstage → Vogel' },
  ];
}
