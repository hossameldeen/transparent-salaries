import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DBService} from 'src/app/services/db.service';
import {ProgressBarService} from 'src/app/services/progress-bar.service';
import {MatFormField, MatSnackBar} from '@angular/material';
import {Trustee, encode as encodeTrustee, decode as decodeTrustee} from 'src/app/models/trustee.model';
import {Profile, encode as encodeProfile, decode as decodeProfile} from 'src/app/models/profile.model';
import {ProfileService, ProfileState, ProfileStateKind} from 'src/app/services/profile.service';
import {Subscription} from 'rxjs';
import {UtilService} from 'src/app/services/util.service';
import {DomSanitizer} from '@angular/platform-browser';
import {LicenseKeyService} from 'src/app/services/license-key.service';

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
  stateSubjectSubscription: Subscription;
  @ViewChild('displayNameFormField') displayNameFormField: MatFormField;

  constructor(
    readonly sanitizer: DomSanitizer,
    readonly profileService: ProfileService,
    readonly utilService: UtilService,
    readonly licenseKeyService: LicenseKeyService,
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar
  ) {
    this.displayNameState = { kind: "loading" }
  }

  async ngOnInit() {
    // TODO: Having to do it here to wait till `profileDatArchive` has been binded. However, that's bad because `state` will be undefined
    // TODO or something for some time.
    this.setState(this.profileService.stateSubject.value)
    this.stateSubjectSubscription = this.profileService.stateSubject.subscribe(profileState => this.setState(profileState))

    // Note: waiting wouldn't really make a difference.
    await this.retrieveDisplayName()
  }

  startEditDisplayName(s: LoggedInAndIsOwner) {
    const initialInputValue = this.displayNameState.kind === "loaded" ? this.displayNameState.displayName : ""; // if loading or failure, just initialize it to empty
    this.state = new LoggedInAndIsOwner(s.loggedInDatArchive, { editing: true, inputValue: initialInputValue, updating: false })

    // thanks to https://stackoverflow.com/a/51848683/6690391. I honestly don't know why I need to call it in a timeout.
    setTimeout(() => this.displayNameFormField.updateOutlineGap())
  }

  updateDisplayNameInputValue(s: LoggedInAndIsOwner, newInputValue: string) {
    this.state = new LoggedInAndIsOwner(s.loggedInDatArchive, { editing: true, inputValue: newInputValue, updating: false })
  }

  async confirmDisplayNameEdit(s: LoggedInAndIsOwner) {
    if (s.editingState.editing) {
      await this.dbService.putRow2<Profile>(s.loggedInDatArchive, 'profiles', new Profile(s.editingState.inputValue), this.dbService.PROFILE_ROW_UUID, encodeProfile)

      // Re-retrieve displayName
      await this.retrieveDisplayName()

      // TODO: refactor this whole state thing. Possibilities of unthought-of race conditions.
      // because the state might have changed during the request
      if (this.state.kind === StateKind.LoggedInAndIsOwner && this.state.loggedInDatArchive.url === s.loggedInDatArchive.url) {
        this.state = new LoggedInAndIsOwner(this.state.loggedInDatArchive, { editing: false })
      }
    }
    else
      throw Error("Confirm clicked but not in display-name-editing state. Should never happen.")
  }

  cancelDisplayNameEdit(s: LoggedInAndIsOwner) {
    this.state = new LoggedInAndIsOwner(s.loggedInDatArchive, { editing: false })
  }

  async trust(loggedInAndNotOwnerState: LoggedInAndNotOwner) {
    const row = await this.dbService.putRow<Trustee>(loggedInAndNotOwnerState.loggedInDatArchive, 'trustees', new Trustee(this.profileDatArchive.url), encodeTrustee)

    // TODO: refactor this whole state thing. Possibilities of unthought-of race conditions.
    // because the state might have changed during the request
    if (this.state.kind === StateKind.LoggedInAndNotOwner && this.state.loggedInDatArchive.url === loggedInAndNotOwnerState.loggedInDatArchive.url) {
      this.state = new LoggedInAndNotOwner(this.state.loggedInDatArchive, { kind: "loaded", isTrusted: true, trusteeUuid: row.uuid })
    }
  }

  async untrust(loggedInAndNotOwnerState: LoggedInAndNotOwner, trusteeUuid: string) {
    await this.dbService.deleteRow<Trustee>(loggedInAndNotOwnerState.loggedInDatArchive, 'trustees', trusteeUuid)

    // TODO: refactor this whole state thing. Possibilities of unthought-of race conditions.
    // because the state might have changed during the request
    if (this.state.kind === StateKind.LoggedInAndNotOwner && this.state.loggedInDatArchive.url === loggedInAndNotOwnerState.loggedInDatArchive.url) {
      this.state = new LoggedInAndNotOwner(this.state.loggedInDatArchive, { kind: "loaded", isTrusted: false })
    }
  }

  liaiso(state: State): LoggedInAndIsOwner {
    return <LoggedInAndIsOwner>state;
  }

  liano(state: State): LoggedInAndNotOwner {
    return <LoggedInAndNotOwner>state;
  }

  nli(state: State): NotLoggedIn {
    return <NotLoggedIn>state;
  }

  private async retrieveDisplayName(): Promise<void> {
    this.progressBarService.pushLoading()
    try {
      const profileRow = await this.dbService.readRow<Profile>(this.profileDatArchive, 'profiles', this.dbService.PROFILE_ROW_UUID, decodeProfile)
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

  private setState(loggedInProfileState: ProfileState): void {
    switch (loggedInProfileState.kind) {
      case ProfileStateKind.ProfileNotSelected:
        this.state = new NotLoggedIn()
        break;
      case ProfileStateKind.ProfileSelected:
        if (loggedInProfileState.datArchive.url === this.profileDatArchive.url) {
          this.state = new LoggedInAndIsOwner(loggedInProfileState.datArchive, { editing: false })
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

    try {
      const trusteesOrFailures = (await this.dbService.readAllRows<Trustee>(loggedInAndNotOwnerState.loggedInDatArchive, 'trustees', decodeTrustee)).entries

      // Check that state hasn't changed while you were doing the request
      if (loggedInAndNotOwnerState !== this.state)
        return;

      let atLeastOneFailed = false
      let trusteeUuid: string | null = null
      for (const trusteeOrFailure of trusteesOrFailures) {
        if (trusteeOrFailure.status === "succeeded") {
          if (this.profileDatArchive.url === trusteeOrFailure.row.dbRowData.datUrl)
            trusteeUuid = trusteeOrFailure.row.uuid
        }
        else {
          atLeastOneFailed = true
        }
      }

      if (trusteeUuid !== null)
        this.state = new LoggedInAndNotOwner(loggedInAndNotOwnerState.loggedInDatArchive, { kind: "loaded", isTrusted: true, trusteeUuid: trusteeUuid })
      else
        this.state = new LoggedInAndNotOwner(loggedInAndNotOwnerState.loggedInDatArchive, { kind: "loaded", isTrusted: false })

      if (atLeastOneFailed)
        this.snackBar.open("Couldn't retrieve some trustees from the profile. That's all I know :(", "Dismiss")
    }
    catch(e) {
      this.snackBar.open("Couldn't retrieve trustees from the profile. That's all I know :(", "Dismiss")
    }
    finally {
      this.progressBarService.popLoading()
    }
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
    readonly editingState: { editing: false } | { editing: true, inputValue: string, updating: boolean },
    readonly kind: StateKind.LoggedInAndIsOwner = StateKind.LoggedInAndIsOwner
  ) { }
}

export class LoggedInAndNotOwner {
  constructor(
    readonly loggedInDatArchive: DatArchive,
    readonly isTrustedState: { kind: "loading"} | { kind: "loaded", isTrusted: false } | { kind: "loaded", isTrusted: true, trusteeUuid: string },
    readonly kind: StateKind.LoggedInAndNotOwner = StateKind.LoggedInAndNotOwner
  ) { }
}

export class NotLoggedIn {
  constructor(
    readonly kind: StateKind.NotLoggedIn = StateKind.NotLoggedIn
  ) { }
}

