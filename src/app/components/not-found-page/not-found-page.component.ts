import { Component } from '@angular/core';
import {AppInitStatus, AppInitService} from 'src/app/services/app-init.service';

@Component({
  selector: 'app-not-found-page-dont-use-selector-check-readme',
  templateUrl: './not-found-page.component.html'
})
export class NotFoundPageComponent {

  AppInitStatus = AppInitStatus; // To be available in the html

  constructor(readonly appInitService: AppInitService) { }
}

