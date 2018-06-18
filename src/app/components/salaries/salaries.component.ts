import { Component, Input } from '@angular/core';
import { TableDataSource } from 'angular4-material-table';

@Component({
  selector: 'app-salaries',
  templateUrl: './salaries.component.html'
})
export class SalariesComponent {

  @Input() profileDatArchive: DatArchive;

  displayedColumns: string[] = ['month', 'actionsColumn'];
  dataSource: TableDataSource<Salary>;

  constructor() {
    this.dataSource = new TableDataSource<Salary>(ELEMENT_DATA, undefined, undefined, { prependNewElements: true })
  }
}

class Salary {
  constructor(
    readonly month: string
  ) { }
}

const ELEMENT_DATA = [
  new Salary("1")
]
