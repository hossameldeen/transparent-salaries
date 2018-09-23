import { Component } from '@angular/core';
import { ProgressBarService } from 'src/app/services/progress-bar.service';
import { ProfileService, ProfileStateKind } from 'src/app/services/profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  showProgressBar: boolean = false;
  ProfileStateKind = ProfileStateKind;

  constructor(
    readonly profileService: ProfileService,
    readonly progressBarService: ProgressBarService
  ) { }
}
