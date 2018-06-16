import { Component, Input } from '@angular/core';

// TODO: Copy-pasted because I couldn't make it in its own type-declaration file
declare class DatArchive {
  static selectArchive(opts: any): Promise<DatArchive>;
  static create(opts: any): Promise<DatArchive>;
  constructor(datUrl: String);
  url: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  @Input() profileDatArchive: DatArchive;

  constructor() { }
}

