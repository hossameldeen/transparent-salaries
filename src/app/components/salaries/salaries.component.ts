import { Component, Input } from '@angular/core';
import { TableDataSource, TableElement } from 'angular4-material-table';
import { Salary } from 'src/app/models/salary.model';
import { UtilService } from 'src/app/services/util.service';
import { DBRow } from 'src/app/models/db-row.model';
import { DBService } from 'src/app/services/db.service';

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
  readonly dataSource: TableDataSource<TableRow>;
  persistingNewSalary: boolean = false;

  constructor(
    private readonly dbService: DBService,
    private readonly utilService: UtilService
  ) {
    // this.dataSource = new TableDataSource<TableRow>(ELEMENT_DATA.map(e => new ExistingRow(new DBRow('', e))), undefined, undefined, { prependNewElements: true })
    // TODO: An ugly hack, adding a row & removing it. Doing that because I don't know how to send a property dataType/constructor.
    this.dataSource = new TableDataSource<TableRow>([new NewRow(new Salary('', '', '', '', '', ''))], undefined, undefined, { prependNewElements: true })
    this.dataSource.getRow(0).delete()
  }

  salary(row: TableRow): Salary {
    switch (row.kind) {
      case TableRowKind.ExistingRow: return row.salaryDBRow.dbRowData
      case TableRowKind.NewRow: return row.salary
      default: return this.utilService.assertNever(row)
    }
  }

  /**
   * Credits: https://github.com/irossimoline/angular4-material-table/issues/6#issuecomment-359479471
   */
  createNewWithDefaultValues() {
    this.dataSource.createNew()
    const row = this.dataSource.getRow(-1)
    row.currentData = new NewRow(new Salary(this.utilService.getCurrentMonth(), '', '', '', '', ''))
  }

  delete(row: TableElement<ExistingRow>) {
    row.currentData = new ExistingRow(row.currentData.salaryDBRow, true)
    setTimeout(() => {
      row.currentData = new ExistingRow(row.currentData.salaryDBRow, false);
      row.delete()
    }, 3000)
  }

  async confirmEditCreate(row: TableElement<TableRow>) {
    switch (row.currentData.kind) {
      case TableRowKind.ExistingRow: {
        row.currentData = new ExistingRow(row.currentData.salaryDBRow, true)
        const salaryDBRow = await this.dbService.putRow2<Salary>(this.profileDatArchive, 'salaries', row.currentData.salaryDBRow.dbRowData, row.currentData.salaryDBRow.uuid)
        row.currentData = new ExistingRow(salaryDBRow, false)
        break;
      }
      case TableRowKind.NewRow: {
        this.persistingNewSalary = true;
        row.currentData = new NewRow(row.currentData.salary, true)
        const salaryDBRow = await this.dbService.putRow<Salary>(this.profileDatArchive, 'salaries', row.currentData.salary)
        row.currentData = new ExistingRow(salaryDBRow, false)
        this.persistingNewSalary = false;
        break;
      }
      default: this.utilService.assertNever(row.currentData)
    }
    // TODO: If we add validation later on, we need to check on this call's return value first.
    row.confirmEditCreate()
  }
}

/**
 * Either a new Salary, or a DBRow of an existing salary
 */
type TableRow = ExistingRow | NewRow

enum TableRowKind { ExistingRow, NewRow }

class ExistingRow {
  constructor(
    readonly salaryDBRow: DBRow<Salary>,
    readonly locked: boolean = false,
    readonly kind: TableRowKind.ExistingRow = TableRowKind.ExistingRow
  ) { }
}

class NewRow {
  constructor(
    readonly salary: Salary,
    readonly locked: boolean = false,
    readonly kind: TableRowKind.NewRow = TableRowKind.NewRow
  ) { }
}

const ELEMENT_DATA = [
  new Salary("2018-06", "Valeo", "Software Engineer - Tooling", "14000", "EGP", "~1 year of experience"),
  new Salary("2018-06", "Emerge", "Software Engineer", "900", "USD", "~2 years of experience"),
  new Salary("2018-06", "C3S", "Software Engineer", "1000", "USD", "~1 year of experience http://www.c3s.co/ - no insurance")
]
