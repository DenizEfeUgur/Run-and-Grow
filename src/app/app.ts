import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RunStoreService } from './services/run-store.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly store = inject(RunStoreService);

  protected readonly navItems: NavItem[] = [
    { path: '/dashboard', label: 'Start', icon: '🏡' },
    { path: '/training', label: 'Training', icon: '➕' },
    { path: '/garden', label: 'Garten', icon: '🌳' },
    { path: '/history', label: 'Historie', icon: '📜' },
    { path: '/settings', label: 'Optionen', icon: '⚙️' },
  ];
}
