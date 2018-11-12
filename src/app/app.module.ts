import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatCardModule, MatTabsModule, MatInputModule, MatFormFieldModule, MatToolbarModule, MatTableModule, MatIconModule, MatTooltipModule, MatDividerModule, MatSnackBarModule, MatProgressBarModule, MatProgressSpinnerModule, MatListModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SalariesComponent } from './components/salaries/salaries.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { AppInitComponent } from './components/app-init/app-init.component';
import { TrusteesComponent } from './components/trustees/trustees.component';
import { SalaryFormComponent } from './components/salary-form/salary-form.component';
import { DisableRouteReuseStrategy } from './misc/disable-route-reuse-strategy';

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
    SalariesComponent,
    AppInitComponent,
    TrusteesComponent,
    SalaryFormComponent
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
    MatListModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: DisableRouteReuseStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
