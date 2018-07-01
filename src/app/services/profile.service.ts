import { Injectable } from '@angular/core';
import { ProgressBarService } from './progress-bar.service';
import { MatSnackBar } from '@angular/material';
import { UtilService } from './util.service';
import { DBService } from './db.service';

/**
 * Made this service because there's common logic between the toolbar in app-component & home-component in home-page-component
 * 
 * The extraction worked because the common logic uses services. I might would've needed to make a component or something. 
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  state: ProfileState;

  constructor(
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar,
    private readonly utilService: UtilService
  ) {
    const profileUrl = localStorage.getItem('profileUrl')
    if (profileUrl)
      this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: new DatArchive(profileUrl)}
    else
      this.state = { kind: ProfileStateKind.ProfileNotSelected }
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
      this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
      location.reload()
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
      this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
      location.reload()
      this.progressBarService.popLoading()
      return
    }

    if (await this.utilService.isNewArchive(profile)) {
      await this.dbService.initDB(profile)
      this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
      location.reload()
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
    this.state = { kind: ProfileStateKind.ProfileNotSelected }
    localStorage.removeItem('profileUrl')
    location.reload()
  }
}

export type ProfileState = ProfileNotSelected | ProfileSelected

export enum ProfileStateKind { ProfileNotSelected, ProfileSelected }

export class ProfileNotSelected {
  constructor(
    readonly kind: ProfileStateKind.ProfileNotSelected = ProfileStateKind.ProfileNotSelected
  ) { }
}

export class ProfileSelected {
  constructor(
    readonly datArchive: DatArchive,
    readonly kind: ProfileStateKind.ProfileSelected = ProfileStateKind.ProfileSelected
  ) { }
}
