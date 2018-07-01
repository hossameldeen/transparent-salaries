import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatCardModule, MatTabsModule, MatInputModule, MatFormFieldModule, MatToolbarModule, MatTableModule, MatIconModule, MatTooltipModule, MatDividerModule, MatSnackBarModule, MatProgressBarModule, MatProgressSpinnerModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SalariesComponent } from './components/salaries/salaries.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'profile/:datPK', component: ProfilePageComponent },
  { path: '**', component: NotFoundPageComponent } // TODO: is `pathMatch: 'full'` needed?
]

@NgModule({
  declarations: [
    AppComponent,
    NotFoundPageComponent,
    HomePageComponent,
    ProfilePageComponent,
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
    MatProgressBarModule,
    MatProgressSpinnerModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
