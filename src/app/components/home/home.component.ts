import {Component} from '@angular/core';
import {ProfileService, ProfileStateKind} from 'src/app/services/profile.service';
import {Router} from '@angular/router';
import {UtilService} from 'src/app/services/util.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  ProfileStateKind = ProfileStateKind;

  constructor(
    readonly profileService: ProfileService,
    private readonly router: Router
  ) { }

  async createProfile() {
    await this.profileService.createProfile()
    await this.navigatedIfSelected()
  }

  async selectProfile() {
    await this.profileService.selectProfile()
    await this.navigatedIfSelected()
  }

  private async navigatedIfSelected() {
    switch (this.profileService.stateSubject.value.kind) {
      case ProfileStateKind.ProfileSelected:
        await this.router.navigateByUrl(`/profile/${this.profileService.stateSubject.value.datArchive.url.slice(6)}`)
        break;
      case ProfileStateKind.ProfileNotSelected:
        // do nothing
        break;
      default:
        UtilService.assertNever(this.profileService.stateSubject.value)
    }
  }
}

