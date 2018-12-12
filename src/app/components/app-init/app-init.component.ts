import { Component } from '@angular/core';
import {AppInitService, AppInitStatus} from 'src/app/services/app-init.service';

@Component({
  selector: 'app-app-init',
  templateUrl: './app-init.component.html'
})
export class AppInitComponent {

  AppInitStatus = AppInitStatus;  // to be available in the html

  constructor(readonly appInitService: AppInitService) { }

}
