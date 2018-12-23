import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ProgressBarService} from './progress-bar.service';
import { SHA3 } from 'sha3';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import {UtilService} from './util.service';

@Injectable({
  providedIn: 'root'
})
export class LicenseKeyService {

  // TODO: The `as string` is not so clean.
  stateSubject: BehaviorSubject<LicenseKeyState> = new BehaviorSubject<LicenseKeyState>(
    localStorage.getItem('licenseKeyState') === null ? new NotEntered() : JSON.parse(localStorage.getItem('licenseKeyState') as string)
  );

  constructor(
    private readonly progressBarService: ProgressBarService,
    private readonly snackBarService: SnackBarService
  ) {
    // Don't need to remove listener because this service's lifetime spans the whole application
    window.addEventListener('storage', ev => {
      if (ev.key === 'licenseKeyState') {
        const newLicenseKeyState = ev.newValue === null ? new NotEntered() : JSON.parse(ev.newValue)
        if (this.stateSubject.value !== newLicenseKeyState)
          this.stateSubject.next(newLicenseKeyState)
      }
    })
  }

  async init(): Promise<void> {
    switch(this.stateSubject.value.kind) {
      case LicenseKeyStateKind.Entered:
        try {
          this.progressBarService.pushLoading()
          const hashesArchive = await DatArchive.load('dat://77ee6848c4e2d3335ba6c8ad918f9b40b9a04126059078b1e1ab390766a4dce8')
          try {
            await hashesArchive.stat(`/version-0/${(new SHA3(512)).update(this.stateSubject.value.licenseKey).digest('hex')}`)
            this.updateLicenseKeyState(new Verified(this.stateSubject.value.licenseKey))
            this.snackBarService.openQueued("License key has been verified. Thank you for buying!", "Dismiss")
          }
          catch (e) {
            if (this.haveTwoDaysPassed(this.stateSubject.value)) {
              this.snackBarService.openQueuedSupportDismiss("Couldn't verify license key and more than 2 days have passed. Please, make sure to enter a correct license key, or use go to Support if you think something is not right.")
            }
          }
        }
        catch (e) {
          if (this.haveTwoDaysPassed(this.stateSubject.value)) {
            this.snackBarService.openQueuedSupportDismiss("Failed to verify license key. Couldn't access dat://77ee6848c4e2d3335ba6c8ad918f9b40b9a04126059078b1e1ab390766a4dce8")
          }
        }
        finally {
          this.progressBarService.popLoading()
        }
        break;
      case LicenseKeyStateKind.NotEntered:
        // do nothing
        break;
      case LicenseKeyStateKind.Verified:
        // do nothing
        break;
      default: UtilService.assertNever(this.stateSubject.value)
    }
  }

  async enterLicenseKey(licenseKey: string): Promise<{ kind: "verified" } | { kind: "not-verified" }> {
    try {
      this.progressBarService.pushLoading()
      const hashesArchive = await DatArchive.load('dat://77ee6848c4e2d3335ba6c8ad918f9b40b9a04126059078b1e1ab390766a4dce8')
      try {
        await hashesArchive.stat(`/version-0/${(new SHA3(512)).update(licenseKey).digest('hex')}`)
        this.updateLicenseKeyState(new Verified(licenseKey))
        return { kind: "verified" }
      }
      catch (e) {
        this.updateLicenseKeyState(new Entered(licenseKey, (new Date()).getTime().toString()))
        return { kind: "not-verified" }
      }
    }
    catch (e) {
      this.snackBarService.openQueuedSupportDismiss("Failed to verify. Couldn't access dat://77ee6848c4e2d3335ba6c8ad918f9b40b9a04126059078b1e1ab390766a4dce8")
      this.updateLicenseKeyState(new Entered(licenseKey, (new Date()).getTime().toString()))
      return { kind: "not-verified" }
    }
    finally {
      this.progressBarService.popLoading()
    }
  }

  updateLicenseKeyState(licenseKeyState: LicenseKeyState) {
    localStorage.setItem('licenseKeyState', JSON.stringify(licenseKeyState))
    if (licenseKeyState !== this.stateSubject.value)
      this.stateSubject.next(licenseKeyState)
  }

  haveTwoDaysPassed(licenseKeyState: Entered): boolean {
    return ((new Date()).getTime() - parseInt(licenseKeyState.enterTimestamp)) / 1000 / 60 / 60 / 24 > 2
    // return ((new Date()).getTime() - parseInt(licenseKeyState.enterTimestamp)) / 1000 > 30
  }

  isTrial(licenseKeyState: LicenseKeyState): boolean {
    return licenseKeyState.kind === LicenseKeyStateKind.NotEntered || (licenseKeyState.kind === LicenseKeyStateKind.Entered && this.haveTwoDaysPassed(licenseKeyState))
  }
}

export type LicenseKeyState = NotEntered | Entered | Verified

export enum LicenseKeyStateKind { NotEntered, Entered, Verified }

export class NotEntered {
  constructor (
    readonly kind: LicenseKeyStateKind.NotEntered = LicenseKeyStateKind.NotEntered
  ) { }
}

export class Entered {
  constructor (
    readonly licenseKey: string,
    readonly enterTimestamp: string,
    readonly kind: LicenseKeyStateKind.Entered = LicenseKeyStateKind.Entered
  ) { }
}

export class Verified {
  constructor (
    readonly licenseKey: string,
    readonly kind: LicenseKeyStateKind.Verified = LicenseKeyStateKind.Verified
  ) { }
}
