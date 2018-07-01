import { Component, OnDestroy } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { DBService } from 'src/app/services/db.service';
import { MatSnackBar } from '@angular/material';
import { ProgressBarService } from 'src/app/services/progress-bar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy {
  state: State;
  showProgressBar: boolean = false;
  readonly showProgressBarSubscription: Subscription;
  StateKind = StateKind;

  constructor(
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar,
    private readonly utilService: UtilService
  ) {
    const profileUrl = localStorage.getItem('profileUrl')
    if (profileUrl)
      this.state = { kind: StateKind.ProfileSelected, datArchive: new DatArchive(profileUrl)}
    else
      this.state = { kind: StateKind.ProfileNotSelected }
    
    this.showProgressBarSubscription = this.progressBarService.progressBarObservable.subscribe(e =>
      this.showProgressBar = e.showProgressBar
    )
  }

  ngOnDestroy(): void {
    // Check this if you have many subscriptions one day: https://stackoverflow.com/a/42274637/6690391
    this.showProgressBarSubscription.unsubscribe()
  }

  async createProfile() {
    const profile = await this.utilService.datArchiveCreate({
      title: `Salary-Transparency Profile: <Replace with profile name>`,
      buttonLabel: 'Select profile',
      filters: {
        isOwner: true
      }
    })

    if (profile === null)
      return
    
    try {
      this.progressBarService.pushLoading()
      await this.dbService.initDB(profile)
      this.state = { kind: StateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
    }
    catch (e) {
      this.snackBar.open("Couldn't initialize your profile and that's all I know :(", "Dismiss")
    }
    this.progressBarService.popLoading()
  }

  async selectProfile() {
    const profile = await this.utilService.datArchiveSelectArchive({
      title: 'Select an archive to use as your user profile',
      buttonLabel: 'Select profile',
      filters: {
        isOwner: true
      }
    })

    if (profile === null)
      return

    this.progressBarService.pushLoading()

    if (await this.dbService.isDBInitialized(profile)) {
      this.state = { kind: StateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
      this.progressBarService.popLoading()
      return
    }

    if (await this.utilService.isNewArchive(profile)) {
      await this.dbService.initDB(profile)
      this.state = { kind: StateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
      this.progressBarService.popLoading()
      return
    }

    this.snackBar.open(`The archive you've selected doesn't seem to be a valid Transparent-Salaries profile.
      Are you sure you've used it as a profile before?
      If you haven't created a profile, you can create a new one!
    `, "Dismiss")

    this.progressBarService.popLoading()
  }

  logout() {
    this.state = { kind: StateKind.ProfileNotSelected }
    localStorage.removeItem('profileUrl')
  }
}

type State = ProfileNotSelected | ProfileSelected

enum StateKind { ProfileNotSelected, ProfileSelected }

class ProfileNotSelected {
  constructor(
    readonly kind: StateKind.ProfileNotSelected
  ) { }
}

class ProfileSelected {
  constructor(
    readonly kind: StateKind.ProfileSelected,
    readonly datArchive: DatArchive
  ) { }
}
