import { Component } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { DBService } from 'src/app/services/db.service';
import { MatSnackBar, MatProgressBarModule } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  state: State;
  StateKind = StateKind;
  backgroundProcesses = 0; // TODO: technical debt. What if an exception is thrown?

  constructor(
    private readonly utilService: UtilService,
    private readonly dbService: DBService,
    private readonly snackBar: MatSnackBar
  ) {
    const profileUrl = localStorage.getItem('profileUrl')
    if (profileUrl)
      this.state = { kind: StateKind.ProfileSelected, datArchive: new DatArchive(profileUrl)}
    else
      this.state = { kind: StateKind.ProfileNotSelected }
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
      ++this.backgroundProcesses
      await this.dbService.initDB(profile)
      this.state = { kind: StateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
    }
    catch (e) {
      this.snackBar.open("Couldn't initialize your profile and that's all I know :(", "Dismiss")
    }
    --this.backgroundProcesses
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

    ++this.backgroundProcesses

    if (await this.dbService.isDBInitialized(profile)) {
      this.state = { kind: StateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
      --this.backgroundProcesses
      return
    }

    if (await this.utilService.isNewArchive(profile)) {
      await this.dbService.initDB(profile)
      this.state = { kind: StateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
      --this.backgroundProcesses
      return
    }

    this.snackBar.open(`The archive you've selected doesn't seem to be a valid Transparent-Salaries profile.
      Are you sure you've used it as a profile before?
      If you haven't created a profile, you can create a new one!
    `, "Dismiss")

    --this.backgroundProcesses
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
