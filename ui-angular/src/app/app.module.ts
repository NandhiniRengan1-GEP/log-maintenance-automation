import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ErrorListComponent } from './components/error-list/error-list.component';
import { DiagnosticViewerComponent } from './components/diagnostic-viewer/diagnostic-viewer.component';
import { FixViewerComponent } from './components/fix-viewer/fix-viewer.component';
import { PrListComponent } from './components/pr-list/pr-list.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ErrorListComponent,
    DiagnosticViewerComponent,
    FixViewerComponent,
    PrListComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
