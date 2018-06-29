import { Component, Input } from '@angular/core';
import { TableDataSource, TableElement } from 'angular4-material-table';
import { Salary } from 'src/app/models/salary.model';
import { UtilService } from 'src/app/services/util.service';
import { Lockable } from 'src/app/models/lockable.model';

@Component({
  selector: 'app-salaries',
  templateUrl: './salaries.component.html'
})
export class SalariesComponent {

  @Input() profileDatArchive: DatArchive;

  /**
   * Pretty much taken from the html.
   * 
   * `hintText` can be omitted.
   */
  readonly columnsConfigs = [
    {
      matColumnDef: 'month', matHeaderCellDef: 'Month',
      propertyName: 'month',
      inputPlaceholder: 'Month', inputType: 'month',
      hintText: 'Any month this salary was paid on.'
    },
    {
      matColumnDef: 'company', matHeaderCellDef: 'Company',
      propertyName: 'company',
      inputPlaceholder: 'Company', inputType: 'text'
    },
    {
      matColumnDef: 'job', matHeaderCellDef: 'Job',
      propertyName: 'job',
      inputPlaceholder: 'Job', inputType: 'text'
    },
    {
      matColumnDef: 'netSalary', matHeaderCellDef: 'Net salary',
      propertyName: 'netSalary',
      inputPlaceholder: 'Net salary', inputType: 'number',
      hintText: 'Salary after taxes, ... etc.'
    },
    {
      matColumnDef: 'currency', matHeaderCellDef: 'Currency',
      propertyName: 'currency',
      inputPlaceholder: 'Currency', inputType: 'text',
      hintText: 'E.g., USD, EGP, ... etc.'
    },
    {
      matColumnDef: 'otherInfo', matHeaderCellDef: 'Other info',
      propertyName: 'otherInfo',
      inputPlaceholder: 'Other info', inputType: 'text',
      hintText: 'Any other info you want to include.'
    },
  ];

  readonly displayedColumns: string[] = this.columnsConfigs.map(cc => cc.matColumnDef).concat('actionsColumn');
  readonly dataSource: TableDataSource<Lockable<Salary>>;

  constructor(private readonly utilService: UtilService) {
    const elementData = ELEMENT_DATA.map(e => new Lockable(false, e))
    this.dataSource = new TableDataSource<Lockable<Salary>>(elementData, undefined, undefined, { prependNewElements: true })
  }

  /**
   * Credits: https://github.com/irossimoline/angular4-material-table/issues/6#issuecomment-359479471
   */
  createNewWithDefaultValues() {
    this.dataSource.createNew()
    const row = this.dataSource.getRow(-1)
    row.currentData = new Lockable(false, new Salary(this.utilService.getCurrentMonth(), '', '', '', '', ''))
  }

  delete(row: TableElement<Lockable<Salary>>) {
    // TODO: The if-condition is a temp workaround. Check https://github.com/irossimoline/angular4-material-table/issues/17
    if (row.currentData !== undefined) {
      row.currentData = new Lockable(true, row.currentData.data)
      setTimeout(() => {
        // same as if-condition above
        if (row.currentData !== undefined)
          row.currentData = new Lockable(false, row.currentData.data); row.delete()
      }, 3000)
    }
  }
}

const ELEMENT_DATA = [
  new Salary("2018-06", "Valeo", "Software Engineer - Tooling", "14000", "EGP", "~1 year of experience"),
  new Salary("2018-06", "Emerge", "Software Engineer", "900", "USD", "~2 years of experience"),
  new Salary("2018-06", "C3S", "Software Engineer", "1000", "USD", "~1 year of experience http://www.c3s.co/ - no insurance")
]
