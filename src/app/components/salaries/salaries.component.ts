import { Component, Input } from '@angular/core';
import { TableDataSource } from 'angular4-material-table';

@Component({
  selector: 'app-salaries',
  templateUrl: './salaries.component.html'
})
export class SalariesComponent {

  @Input() profileDatArchive: DatArchive;

  displayedColumns: string[] = ['month', 'company', 'job', 'netSalary', 'currency', 'otherInfo', 'actionsColumn'];
  dataSource: TableDataSource<Salary>;

  constructor() {
    this.dataSource = new TableDataSource<Salary>(ELEMENT_DATA, undefined, undefined, { prependNewElements: true })
  }
}

class Salary {
  constructor(
    readonly month: string,
    readonly company: string,
    readonly job: string,
    readonly netSalary: string,
    readonly currency: string,
    readonly otherInfo: string
  ) { }
}

const ELEMENT_DATA = [
  new Salary("2018-06", "2", "3", "4", "5", "6"),
  new Salary("1", "2", "3", "4", "5", "6"),
  new Salary("1", "2", "3", "4", "5", "6")
]
