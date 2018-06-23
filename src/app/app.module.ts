import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule, MatTabsModule, MatInputModule, MatFormFieldModule, MatToolbarModule, MatTableModule, MatIconModule, MatTooltipModule, MatDividerModule, MatSnackBarModule, MatProgressBarModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SalariesComponent } from './components/salaries/salaries.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    SalariesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
