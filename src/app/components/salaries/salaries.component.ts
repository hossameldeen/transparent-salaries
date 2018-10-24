import { Component, Input, OnInit } from '@angular/core';
import { TableDataSource, TableElement } from 'angular4-material-table';
import { Salary } from 'src/app/models/salary.model';
import { UtilService } from 'src/app/services/util.service';
import { DBRow } from 'src/app/models/db-row.model';
import { DBService } from 'src/app/services/db.service';
import { ProgressBarService } from 'src/app/services/progress-bar.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-salaries',
  templateUrl: './salaries.component.html'
})
export class SalariesComponent implements OnInit {

  @Input() profileDatArchive: DatArchive;
  @Input() isOwner: boolean;

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
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar,
    private readonly utilService: UtilService,
  ) {
    // this.dataSource = new TableDataSource<TableRow>(ELEMENT_DATA.map(e => new ExistingRow(new DBRow('', e))), undefined, undefined, { prependNewElements: true })
    // TODO: An ugly hack, adding a row & removing it. Doing that because I don't know how to send a property dataType/constructor.
    this.dataSource = new TableDataSource<TableRow>([new NewRow(new Salary('', '', '', '', '', ''))], undefined, undefined, { prependNewElements: true })
    this.dataSource.getRow(0).delete()
  }

  async ngOnInit(): Promise<void> {

    this.progressBarService.pushLoading()

    try {
      const salariesOrFailures = await this.dbService.readAllRows<Salary>(this.profileDatArchive, 'salaries')

      const succeeded: Array<DBRow<Salary>> = []
      let atLeastOneFailed = false
      for (const salaryOrFailure of salariesOrFailures) {
        if (salaryOrFailure.status === 'succeeded')
          succeeded.push(salaryOrFailure.row)
        else
          atLeastOneFailed = true
      }

      this.dataSource.updateDatasource(succeeded.map(salaryDBRow => new ExistingRow(salaryDBRow)))

      if (atLeastOneFailed)
        this.snackBar.open("Couldn't retrieve some salaries from the profile. That's all I know :(", "Dismiss")
    }
    catch(e) {
      this.snackBar.open("Couldn't retrieve salaries from the profile. That's all I know :(", "Dismiss")
    }
    finally {
      this.progressBarService.popLoading()
    }
  }

  salary(row: TableRow): Salary {
    switch (row.kind) {
      case TableRowKind.ExistingRow: return row.salaryDBRow.dbRowData
      case TableRowKind.NewRow: return row.salary
      default: return UtilService.assertNever(row)
    }
  }

  /**
   * Credits: https://github.com/irossimoline/angular4-material-table/issues/6#issuecomment-359479471
   */
  createNewWithDefaultValues() {
    this.dataSource.createNew()
    const row = this.dataSource.getRow(-1)
    row.currentData = new NewRow(new Salary(UtilService.getCurrentMonth(), '', '', '', '', ''))
  }

  async delete(row: TableElement<ExistingRow>) {
    row.currentData = new ExistingRow(row.currentData.salaryDBRow, true)
    await this.dbService.deleteRow(this.profileDatArchive, 'salaries', row.currentData.salaryDBRow.uuid)
    row.delete()
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
      default: UtilService.assertNever(row.currentData)
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
