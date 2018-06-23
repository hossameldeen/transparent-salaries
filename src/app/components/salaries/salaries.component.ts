import { Component, Input } from '@angular/core';
import { TableDataSource } from 'angular4-material-table';
import { Salary } from 'src/app/models/salary.model';

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

const ELEMENT_DATA = [
  new Salary("2018-06", "Valeo", "Software Engineer - Tooling", "14000", "EGP", "~1 year of experience"),
  new Salary("2018-06", "Emerge", "Software Engineer", "900", "USD", "~2 years of experience"),
  new Salary("2018-06", "C3S", "Software Engineer", "1000", "USD", "~1 year of experience http://www.c3s.co/ - no insurance")
]