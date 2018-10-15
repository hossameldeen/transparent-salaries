import {Component} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {AppInitStatus, ProfileService} from 'src/app/services/profile.service';

@Component({
  selector: 'app-profile-page-dont-use-selector-check-readme',
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent {

  readonly profileDatArchive: DatArchive;
  AppInitStatus = AppInitStatus;  // To be available in the html

  constructor(
    readonly profileService: ProfileService,
    route: ActivatedRoute,
    private readonly router: Router
  ) {
    const datPK = route.snapshot.paramMap.get('datPK')
    this.profileDatArchive = new DatArchive(`dat://${datPK}`)
  }
}
