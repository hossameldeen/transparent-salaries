import {Component, OnDestroy} from '@angular/core';
import {ProgressBarService} from 'src/app/services/progress-bar.service';
import {ProfileService, ProfileStateKind} from 'src/app/services/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {Profile} from 'src/app/models/profile.model';
import {DBService} from 'src/app/services/db.service';
import {Subscription} from 'rxjs';
import {UtilService} from 'src/app/services/util.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy {
  showProgressBar: boolean = false;
  ProfileStateKind = ProfileStateKind;
  displayNameWatchClose: null | (() => void);
  displayNameState: { kind: "loading" } | { kind: "loaded", displayName: string } | { kind: "errored", err: any }; // Not worth making as separate classes & enums
  stateSubjectSubscription: Subscription;

  constructor(
    readonly sanitizer: DomSanitizer,
    readonly dbService: DBService,
    readonly profileService: ProfileService,
    readonly progressBarService: ProgressBarService,
    readonly snackBar: MatSnackBar
  ) {
    this.displayNameState = { kind: "loading" }
    this.displayNameWatchClose = null
    this.retrieveDisplayNameAndWatch()  // fire and forget
    this.stateSubjectSubscription = this.profileService.stateSubject.subscribe(() => this.retrieveDisplayNameAndWatch())
  }

  loadedCast(displayNameState): { kind: "loaded", displayName: string } {
    return <{ kind: "loaded", displayName: string }>displayNameState
  }

  private async retrieveDisplayNameAndWatch(): Promise<void> {
    this.progressBarService.pushLoading()

    try {
      switch(this.profileService.stateSubject.value.kind) {
        case ProfileStateKind.ProfileNotSelected:

          if (this.displayNameWatchClose) {
            this.displayNameWatchClose()
            this.displayNameWatchClose = null
          }

          break;

        case ProfileStateKind.ProfileSelected:

          this.displayNameState = { kind: "loading" }

          const displayNameWatchClose = await this.dbService.watch(this.profileService.stateSubject.value.datArchive, 'profiles', () => this.retrieveDisplayNameAndWatch(), this.dbService.PROFILE_ROW_UUID)

          if (this.displayNameWatchClose)
            this.displayNameWatchClose()
          this.displayNameWatchClose = displayNameWatchClose

          const profileRow = await this.dbService.readRow<Profile>(this.profileService.stateSubject.value.datArchive, 'profiles', this.dbService.PROFILE_ROW_UUID)

          // TODO: Actually state could've change till the above `await` returned. Ignoring for now (and not ignoring in other places, idk why)
          this.displayNameState = { kind: "loaded", displayName: profileRow.dbRowData.displayName }

          break;
        default: UtilService.assertNever(this.profileService.stateSubject.value)
      }
    }
    catch(e) {
      this.displayNameState = { kind: "errored", err: e }
      this.snackBar.open("Couldn't retrieve display name", "Dismiss")
    }
    finally {
      this.progressBarService.popLoading()
    }
  }

  ngOnDestroy() {
    this.stateSubjectSubscription.unsubscribe()
  }
}
