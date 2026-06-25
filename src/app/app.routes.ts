import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { RunFormComponent } from './components/run-form/run-form';
import { GardenComponent } from './components/garden/garden';
import { RunHistoryComponent } from './components/run-history/run-history';
import { SettingsComponent } from './components/settings/settings';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard · Run & Grow' },
  { path: 'training', component: RunFormComponent, title: 'Training hinzufügen · Run & Grow' },
  { path: 'garden', component: GardenComponent, title: 'Garten · Run & Grow' },
  { path: 'history', component: RunHistoryComponent, title: 'Historie · Run & Grow' },
  { path: 'settings', component: SettingsComponent, title: 'Einstellungen · Run & Grow' },
  { path: '**', redirectTo: 'dashboard' },
];
