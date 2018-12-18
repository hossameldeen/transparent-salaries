import {Component, OnDestroy} from '@angular/core';
import {ProgressBarService} from 'src/app/services/progress-bar.service';
import {ProfileService, ProfileStateKind} from 'src/app/services/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {Profile, encode as encodeProfile, decode as decodeProfile} from 'src/app/models/profile.model';
import {DBService} from 'src/app/services/db.service';
import {Subscription} from 'rxjs';
import {UtilService} from 'src/app/services/util.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import {LicenseKeyService, LicenseKeyStateKind} from 'src/app/services/license-key.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy {
  showProgressBar: boolean = false;
  ProfileStateKind = ProfileStateKind;
  displayNameWatchClose: null | (() => void);
  displayNameState: { kind: "loading" } | { kind: "loaded", displayName: string } | { kind: "errored", err: any }; // Not worth making as separate classes & enums
  showBuyNow: boolean;
  stateSubjectSubscription: Subscription;
  licenseKeyStateSubjectSubscription: Subscription;
  showProgressBarSubjectSubscription: Subscription;

  constructor(
    licenseKeyService: LicenseKeyService,
    readonly sanitizer: DomSanitizer,
    private readonly dbService: DBService,
    readonly profileService: ProfileService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBarService: SnackBarService
  ) {
    this.displayNameState = { kind: "loading" }
    this.displayNameWatchClose = null
    this.retrieveDisplayNameAndWatch()  // fire and forget
    this.stateSubjectSubscription = this.profileService.stateSubject.subscribe(() => this.retrieveDisplayNameAndWatch())
    // The setTimeout is to make it async because Subject's next() is sync. The order will be preserved.
    // See: https://stackoverflow.com/questions/53244909/execution-order-of-multiple-settimeout-without-delays-in-angular/53244931#comment93375277_53244931
    this.showProgressBarSubjectSubscription = progressBarService.showProgressBarSubject.subscribe(showProgressBar => setTimeout(() => this.showProgressBar = showProgressBar))
    this.showBuyNow = true
    this.licenseKeyStateSubjectSubscription = licenseKeyService.stateSubject.subscribe(licenseKeyState => setTimeout(() => this.showBuyNow = licenseKeyState.kind === LicenseKeyStateKind.NotEntered))
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

          const profileRow = await this.dbService.readRow<Profile>(this.profileService.stateSubject.value.datArchive, 'profiles', this.dbService.PROFILE_ROW_UUID, decodeProfile)

          // TODO: Actually state could've change till the above `await` returned. Ignoring for now (and not ignoring in other places, idk why)
          this.displayNameState = { kind: "loaded", displayName: profileRow.dbRowData.displayName }

          break;
        default: UtilService.assertNever(this.profileService.stateSubject.value)
      }
    }
    catch(e) {
      this.displayNameState = { kind: "errored", err: e }
      this.snackBarService.openQueuedSupportDismiss("Couldn't retrieve display name")
    }
    finally {
      this.progressBarService.popLoading()
    }
  }

  ngOnDestroy() {
    this.stateSubjectSubscription.unsubscribe()
    this.showProgressBarSubjectSubscription.unsubscribe()
    this.licenseKeyStateSubjectSubscription.unsubscribe()
  }
}
