import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { YearListComponent } from './features/years/year-list/year-list.component';
import { YearDashboardComponent } from './features/years/year-dashboard/year-dashboard.component';
import { MonthLayoutComponent } from './features/months/month-layout/month-layout.component';
import { WeekDetailComponent } from './features/weeks/week-detail/week-detail.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'years', component: YearListComponent },
  { path: 'years/:yearId', component: YearDashboardComponent },
  { path: 'years/:yearId/months/:monthId', component: MonthLayoutComponent },
  { path: 'years/:yearId/months/:monthId/weeks/:weekId', component: WeekDetailComponent },
  { path: '**', redirectTo: '' }
];
