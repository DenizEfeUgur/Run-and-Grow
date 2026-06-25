import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RunStoreService } from '../../services/run-store.service';
import { FEELING_META, RUN_TYPE_META, RunType } from '../../models/run.model';
import { PacePipe } from '../../pipes/pace.pipe';
import { formatHumanDate } from '../../utils/date.utils';

type Filter = RunType | 'all';

@Component({
  selector: 'app-run-history',
  imports: [RouterLink, PacePipe],
  templateUrl: './run-history.html',
  styleUrl: './run-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunHistoryComponent {
  protected readonly store = inject(RunStoreService);
  protected readonly typeMeta = RUN_TYPE_META;
  protected readonly feelingMeta = FEELING_META;
  protected readonly formatDate = formatHumanDate;

  protected readonly filter = signal<Filter>('all');
  protected readonly pendingDelete = signal<string | null>(null);

  protected readonly filterOptions: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Alle' },
    ...(Object.keys(RUN_TYPE_META) as RunType[]).map((value) => ({
      value,
      label: RUN_TYPE_META[value].short,
    })),
  ];

  protected readonly filteredRuns = computed(() => {
    const active = this.filter();
    const runs = this.store.sortedRuns();
    return active === 'all' ? runs : runs.filter((run) => run.type === active);
  });

  protected setFilter(value: Filter): void {
    this.filter.set(value);
  }

  protected askDelete(id: string): void {
    this.pendingDelete.set(id);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected confirmDelete(id: string): void {
    this.store.deleteRun(id);
    this.pendingDelete.set(null);
  }
}
