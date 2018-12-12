import { Component } from '@angular/core';
import {AppInitService, AppInitStatus} from 'src/app/services/app-init.service';

@Component({
  selector: 'app-home-page-dont-use-selector-check-readme',
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {

  AppInitStatus = AppInitStatus;  // To be available in the html

  constructor(readonly appInitService: AppInitService) { }
}

