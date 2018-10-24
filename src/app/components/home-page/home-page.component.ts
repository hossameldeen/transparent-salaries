import { Component } from '@angular/core';
import {AppInitStatus, ProfileService} from 'src/app/services/profile.service';

@Component({
  selector: 'app-home-page-dont-use-selector-check-readme',
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {

  AppInitStatus = AppInitStatus;  // To be available in the html

  constructor(readonly profileService: ProfileService) { }
}

