import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent {

  @Input() profileDatArchive: DatArchive;
  
  trusts: DatArchive[];

  constructor() {
    this.trusts = ELEMENT_DATA;
  }
}

const ELEMENT_DATA = [
  new DatArchive("dat://61c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6/"),
  new DatArchive("dat://62c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6/"),
  new DatArchive("dat://63c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6/"),
  new DatArchive("dat://64c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6/")
]
