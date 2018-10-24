import { Component } from '@angular/core';
import {ProfileService, AppInitStatus} from 'src/app/services/profile.service';

@Component({
  selector: 'app-app-init',
  templateUrl: './app-init.component.html'
})
export class AppInitComponent {

  AppInitStatus = AppInitStatus;  // To be available in the html

  constructor(readonly profileService: ProfileService) { }

}
