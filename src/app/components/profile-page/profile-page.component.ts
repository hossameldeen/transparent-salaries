import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AppInitService, AppInitStatus} from 'src/app/services/app-init.service';

@Component({
  selector: 'app-profile-page-dont-use-selector-check-readme',
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent {

  readonly profileDatArchive: DatArchive;
  AppInitStatus = AppInitStatus;  // To be available in the html

  constructor(
    readonly appInitService: AppInitService,
    route: ActivatedRoute
  ) {
    const datPK = route.snapshot.paramMap.get('datPK')
    this.profileDatArchive = new DatArchive(`dat://${datPK}`)
  }
}
