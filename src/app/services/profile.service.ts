import { Injectable } from '@angular/core';
import { ProgressBarService } from './progress-bar.service';
import { MatSnackBar } from '@angular/material';
import { UtilService } from './util.service';
import { DBService } from './db.service';
import {BehaviorSubject} from 'rxjs';

/**
 * Made this service because there's common logic between the toolbar in app-component & home-component in home-page-component
 *
 * The extraction worked because the common logic uses services. I might would've needed to make a component or something.
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  stateSubject: BehaviorSubject<ProfileState>;
  appInitStatus: AppInitStatus;

  constructor(
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar
  ) {
    const profileUrl = localStorage.getItem('profileUrl')
    if (profileUrl)
      this.stateSubject = new BehaviorSubject<ProfileState>({ kind: ProfileStateKind.ProfileSelected, datArchive: new DatArchive(profileUrl) })
    else
      this.stateSubject = new BehaviorSubject<ProfileState>({ kind: ProfileStateKind.ProfileNotSelected })

    this.appInitStatus = AppInitStatus.Initializing
    this.init()
  }

  async createProfile() {
    const profile = await UtilService.datArchiveCreate({
      title: `Salary-Transparency Profile: <Replace with profile name>`,
      buttonLabel: 'Select profile',
      filters: {
        isOwner: true
      }
    })

    if (profile === null)
      return;

    try {
      await this.selectAndMigrate(profile)
    }
    catch (e) {
      this.snackBar.open("Couldn't initialize your profile. That's all I know :(", "Dismiss")
    }
  }

  async selectProfile() {
    const profile = await UtilService.datArchiveSelectArchive({
      title: 'Select an archive to use as your user profile',
      buttonLabel: 'Select profile',
      filters: {
        isOwner: true
      }
    })

    if (profile === null)
      return;

    try {
      await this.selectAndMigrate(profile)
    }
    catch (e) {
      this.snackBar.open(`*Probably*, the archive you've selected isn't a valid Transparent-Salaries profile. Are you sure you've used it as a profile before? If you haven't created a profile, you can create a new one!`,
        'Dismiss')
    }
  }

  async init(): Promise<void> {
    switch(this.stateSubject.value.kind) {
      case ProfileStateKind.ProfileNotSelected:
        this.appInitStatus = AppInitStatus.Succeeded
        break;
      case ProfileStateKind.ProfileSelected:
        try {
          this.progressBarService.pushLoading()
          this.appInitStatus = AppInitStatus.Initializing
          await this.dbService.migrateDB(this.stateSubject.value.datArchive)
          this.appInitStatus = AppInitStatus.Succeeded
        }
        catch(e) {
          this.appInitStatus = AppInitStatus.Failed
          throw e
        }
        finally {
          this.progressBarService.popLoading()
        }
        break;
      default: UtilService.assertNever(this.stateSubject.value)
    }
  }

  logout(): void {
    this.stateSubject.next({ kind: ProfileStateKind.ProfileNotSelected })
    localStorage.removeItem('profileUrl')
  }

  private async selectAndMigrate(profile: DatArchive): Promise<void> {
    try {
      this.progressBarService.pushLoading()
      await this.dbService.migrateDB(profile);
    }
    finally {
      this.stateSubject.next({ kind: ProfileStateKind.ProfileSelected, datArchive: profile })
      localStorage.setItem('profileUrl', profile.url)
      this.progressBarService.popLoading()
    }
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

export enum AppInitStatus { Succeeded, Initializing, Failed }
