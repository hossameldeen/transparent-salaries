import { Component } from '@angular/core';
import { ProgressBarService } from 'src/app/services/progress-bar.service';
import { ProfileService, ProfileState, ProfileStateKind } from 'src/app/services/profile.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  state: State;
  StateKind = StateKind;  // To make it available in the html template
  ProfileStateKind = ProfileStateKind;  // To make it available in the html template

  constructor(
    readonly profileService: ProfileService,
    readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar
  ) {
    this.state = new Loading()
    this.asyncInit()
  }

  async asyncInit() {
    this.progressBarService.pushLoading()

    try {
      const profileState = await this.profileService.getSelectedProfile()
      this.state = new Loaded(profileState)
    }
    catch(e) {
      this.snackBar.open("Couldn't initialize your profile and that's all I know :(", "Dismiss")
    }

    this.progressBarService.popLoading()
  }
}

type State = Loading | Loaded

enum StateKind { Loading, Loaded }

class Loading {
  constructor(
    readonly kind: StateKind.Loading = StateKind.Loading
  ) { }
}

class Loaded {
  constructor(
    readonly profileState: ProfileState,
    readonly kind: StateKind.Loaded = StateKind.Loaded
  ) { }
}
