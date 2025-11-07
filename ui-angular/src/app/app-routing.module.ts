import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ErrorListComponent } from './components/error-list/error-list.component';
import { DiagnosticViewerComponent } from './components/diagnostic-viewer/diagnostic-viewer.component';
import { FixViewerComponent } from './components/fix-viewer/fix-viewer.component';
import { PrListComponent } from './components/pr-list/pr-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'errors', component: ErrorListComponent },
  { path: 'diagnostic/:transactionId', component: DiagnosticViewerComponent },
  { path: 'fix/:transactionId', component: FixViewerComponent },
  { path: 'prs', component: PrListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
