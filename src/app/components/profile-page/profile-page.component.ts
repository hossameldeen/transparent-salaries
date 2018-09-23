import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService, ProfileStateKind } from 'src/app/services/profile.service';

@Component({
  selector: 'app-profile-page-dont-use-selector-check-readme',
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent {

  readonly profileDatArchive: DatArchive;
  readonly isOwner: boolean;

  constructor(route: ActivatedRoute, profileService: ProfileService, private readonly router: Router) {
    const datPK = route.snapshot.paramMap.get('datPK')
    this.profileDatArchive = new DatArchive(`dat://${datPK}`)
    this.isOwner = (profileService.state.kind === ProfileStateKind.ProfileSelected && this.profileDatArchive.url === profileService.state.datArchive.url)    
  }
}

