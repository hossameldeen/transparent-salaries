import {Component, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService, ProfileStateKind } from 'src/app/services/profile.service';

@Component({
  selector: 'app-profile-page-dont-use-selector-check-readme',
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent implements OnDestroy {

  readonly profileDatArchive: DatArchive;
  isOwner: boolean;

  constructor(
    route: ActivatedRoute,
    private readonly profileService: ProfileService,
    private readonly router: Router
  ) {
    const datPK = route.snapshot.paramMap.get('datPK')
    this.profileDatArchive = new DatArchive(`dat://${datPK}`)
    this.updateIsOwner()
    this.profileService.stateSubject.subscribe(() => this.updateIsOwner())
    this.isOwner = (profileService.stateSubject.value.kind === ProfileStateKind.ProfileSelected && this.profileDatArchive.url === profileService.stateSubject.value.datArchive.url)
  }

  private updateIsOwner(): void {
    this.isOwner = (this.profileService.stateSubject.value.kind === ProfileStateKind.ProfileSelected && this.profileDatArchive.url === this.profileService.stateSubject.value.datArchive.url)
  }

  ngOnDestroy(): void {
    this.profileService.stateSubject.unsubscribe()
  }
}
