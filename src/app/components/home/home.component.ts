import { Component } from '@angular/core';
import { ProfileService, ProfileStateKind } from 'src/app/services/profile.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  ProfileStateKind = ProfileStateKind;

  constructor(readonly profileService: ProfileService) { }
}

