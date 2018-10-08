import {Component} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-page-dont-use-selector-check-readme',
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent {

  readonly profileDatArchive: DatArchive;

  constructor(
    route: ActivatedRoute,
    private readonly router: Router
  ) {
    const datPK = route.snapshot.paramMap.get('datPK')
    this.profileDatArchive = new DatArchive(`dat://${datPK}`)
  }
}
