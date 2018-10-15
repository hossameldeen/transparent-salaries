import { Component } from '@angular/core';
import {AppInitStatus, ProfileService} from 'src/app/services/profile.service';

@Component({
  selector: 'app-not-found-page-dont-use-selector-check-readme',
  templateUrl: './not-found-page.component.html'
})
export class NotFoundPageComponent {

  AppInitStatus = AppInitStatus; // To be available in the html

  constructor(readonly profileService: ProfileService) { }
}

