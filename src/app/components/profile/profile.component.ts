import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DBService} from 'src/app/services/db.service';
import {ProgressBarService} from 'src/app/services/progress-bar.service';
import {MatSnackBar} from '@angular/material';
import {Trustee} from 'src/app/models/trustee.model';
import {Profile} from 'src/app/models/profile.model';
import {ProfileService, ProfileState, ProfileStateKind} from 'src/app/services/profile.service';
import {Subscription} from 'rxjs';
import {UtilService} from 'src/app/services/util.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  /**
   * To be available in the html
   */
  ProfileStateKind = ProfileStateKind;
  StateKind = StateKind;

  state: State;

  /**
   * Not expected to change after loading
   */
  @Input() profileDatArchive: DatArchive;
  displayNameState: { kind: "loading" } | { kind: "loaded", displayName: string } | { kind: "errored", err: any }; // Not worth making as separate classes & enums
  trusts: Trustee[];
  stateSubjectSubscription: Subscription;

  constructor(
    readonly sanitizer: DomSanitizer,
    readonly profileService: ProfileService,
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar,
    private readonly utilService: UtilService
  ) {
    this.setState(this.profileService.stateSubject.value)

    this.displayNameState = { kind: "loading" }
    this.trusts = []
    this.stateSubjectSubscription = this.profileService.stateSubject.subscribe(profileState => this.setState(profileState))
  }

  ngOnInit() {
    // Note: not awaiting to read both displayName & trustees at the same time
    this.retrieveDisplayName()
    this.retrieveTrustees()
  }

  async addTrustee(loggedInAndNotOwnerState: LoggedInAndNotOwner) {
    await this.dbService.putRow<Trustee>(loggedInAndNotOwnerState.loggedInDatArchive, 'trustees', new Trustee(this.profileDatArchive.url))

    // TODO: refactor this whole state thing. Possibilities of unthought-of race conditions.
    // because the state might have changed during the request
    if (this.state.kind === StateKind.LoggedInAndNotOwner && this.state.loggedInDatArchive.url === loggedInAndNotOwnerState.loggedInDatArchive.url) {
      this.state = new LoggedInAndNotOwner(this.state.loggedInDatArchive, { kind: "loaded", isTrusted: true })
    }
  }

  private async retrieveDisplayName(): Promise<void> {
    this.progressBarService.pushLoading()
    try {
      const profileRow = await this.dbService.readRow<Profile>(this.profileDatArchive, 'profiles', this.dbService.PROFILE_ROW_UUID)
      this.displayNameState = { kind: "loaded", displayName: profileRow.dbRowData.displayName }
    }
    catch(e) {
      this.displayNameState = { kind: "errored", err: e }
      this.snackBar.open("Couldn't retrieve display name", "Dismiss")
    }
    finally {
      this.progressBarService.popLoading()
    }
  }

  private async retrieveTrustees(): Promise<void> {
    this.progressBarService.pushLoading()

    // Not wrapping in a try-catch because it should never fail
    const trusteesOrFailures = await this.dbService.readAllRows<Trustee>(this.profileDatArchive, 'trustees')

    let atLeastOneFailed = false
    for (const ret of trusteesOrFailures) {
      if (ret.status === "succeeded") {
        this.trusts.push(ret.row.dbRowData)
      }
      else {
        atLeastOneFailed = true
      }
    }
    if (atLeastOneFailed)
      this.snackBar.open("Couldn't retrieve some trustees from the profile. That's all I know :(", "Dismiss")

    this.progressBarService.popLoading()
  }

  private setState(loggedInProfileState: ProfileState): void {
    switch (loggedInProfileState.kind) {
      case ProfileStateKind.ProfileNotSelected:
        this.state = new NotLoggedIn()
        break;
      case ProfileStateKind.ProfileSelected:
        if (loggedInProfileState.datArchive.url === this.profileDatArchive.url) {
          this.state = new LoggedInAndIsOwner(loggedInProfileState.datArchive, false)
        }
        else {
          this.state = new LoggedInAndNotOwner(loggedInProfileState.datArchive, { kind: "loading" })
          this.updateIsTrusted(this.state)
        }
        break;
      default: UtilService.assertNever(loggedInProfileState)
    }
  }

  private async updateIsTrusted(loggedInAndNotOwnerState: LoggedInAndNotOwner): Promise<void> {
    this.progressBarService.pushLoading()

    const trusteesOrFailures = await this.dbService.readAllRows<Trustee>(loggedInAndNotOwnerState.loggedInDatArchive, 'trustees')

    // Check that state hasn't changed while you were doing the request
    if (loggedInAndNotOwnerState !== this.state)
      return

    let atLeastOneFailed = false
    let foundTrustee = false
    for (const trusteeOrFailure of trusteesOrFailures) {
      if (trusteeOrFailure.status === "succeeded") {
        if (this.profileDatArchive.url === trusteeOrFailure.row.dbRowData.datUrl)
          foundTrustee = true
      }
      else {
        atLeastOneFailed = true
      }
    }
    this.state = new LoggedInAndNotOwner(loggedInAndNotOwnerState.loggedInDatArchive, { kind: "loaded", isTrusted: foundTrustee })
    if (atLeastOneFailed)
      this.snackBar.open("Couldn't retrieve some trustees from the profile. That's all I know :(", "Dismiss")
    this.progressBarService.popLoading()
  }

  ngOnDestroy() {
    this.stateSubjectSubscription.unsubscribe()
  }
}

type State = LoggedInAndIsOwner | LoggedInAndNotOwner | NotLoggedIn

enum StateKind { LoggedInAndIsOwner, LoggedInAndNotOwner, NotLoggedIn }

class LoggedInAndIsOwner {
  constructor(
    readonly loggedInDatArchive: DatArchive,
    readonly isEditingDisplayName: boolean,
    readonly kind: StateKind.LoggedInAndIsOwner = StateKind.LoggedInAndIsOwner
  ) { }
}

export class LoggedInAndNotOwner {
  constructor(
    readonly loggedInDatArchive: DatArchive,
    readonly isTrustedState: { kind: "loading"} | { kind: "loaded", isTrusted: boolean},
    readonly kind: StateKind.LoggedInAndNotOwner = StateKind.LoggedInAndNotOwner
  ) { }
}

export class NotLoggedIn {
  constructor(
    readonly kind: StateKind.NotLoggedIn = StateKind.NotLoggedIn
  ) { }
}

