import { Component } from '@angular/core';
import {Entered, LicenseKeyService, LicenseKeyState, LicenseKeyStateKind, NotEntered, Verified} from 'src/app/services/license-key.service';
import {AppInitService, AppInitStatus} from 'src/app/services/app-init.service';
import {ProgressBarService} from 'src/app/services/progress-bar.service';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html'
})
export class BuyComponent {

  AppInitStatus = AppInitStatus;  // To be available in the html
  LicenseKeyStateKind = LicenseKeyStateKind;  // to be available in the html

  verifyingLicenseKey = false;

  constructor(
    readonly licenseKeyService: LicenseKeyService,
    readonly appInitService: AppInitService,
    readonly progressBarService: ProgressBarService
  ) { }

  async enterLicenseKey(licenseKey: string) {
    this.verifyingLicenseKey = true
    this.progressBarService.pushLoading()
    try {
      await this.licenseKeyService.enterLicenseKey(licenseKey)
    }
    finally {
      this.verifyingLicenseKey = false
      this.progressBarService.popLoading()
    }
  }

  asNotEntered(licenseKeyState: LicenseKeyState) : NotEntered {
    return licenseKeyState as NotEntered
  }

  asEntered(licenseKeyState: LicenseKeyState) : Entered {
    return licenseKeyState as Entered
  }

  asVerified(licenseKeyState: LicenseKeyState) : Verified {
    return licenseKeyState as Verified
  }
}
