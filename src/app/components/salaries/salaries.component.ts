import { Component, Input, OnInit } from '@angular/core';
import { Salary } from 'src/app/models/salary.model';
import { DBRow } from 'src/app/models/db-row.model';
import { DBService } from 'src/app/services/db.service';
import { ProgressBarService } from 'src/app/services/progress-bar.service';
import { MatSnackBar } from '@angular/material';
import { UtilService } from 'src/app/services/util.service';
import { SalaryFormComponent } from 'src/app/components/salary-form/salary-form.component';

@Component({
  selector: 'app-salaries',
  templateUrl: './salaries.component.html'
})
export class SalariesComponent implements OnInit {

  EditingState = EditingState;  // to be available in the template html

  @Input() profileDatArchive: DatArchive;
  @Input() isOwner: boolean;

  /**
   * Pretty much taken from the html.
   *
   * `hintText` can be omitted.
   */
  // readonly columnsConfigs = [
  //   {
  //     matColumnDef: 'month', matHeaderCellDef: 'Month',
  //     propertyName: 'month',
  //     inputPlaceholder: 'Month', inputType: 'month',
  //     hintText: 'Any month this salary was paid on.'
  //   },
  //   {
  //     matColumnDef: 'company', matHeaderCellDef: 'Company',
  //     propertyName: 'company',
  //     inputPlaceholder: 'Company', inputType: 'text'
  //   },
  //   {
  //     matColumnDef: 'job', matHeaderCellDef: 'Job',
  //     propertyName: 'job',
  //     inputPlaceholder: 'Job', inputType: 'text'
  //   },
  //   {
  //     matColumnDef: 'netSalary', matHeaderCellDef: 'Net salary',
  //     propertyName: 'netSalary',
  //     inputPlaceholder: 'Net salary', inputType: 'number',
  //     hintText: 'Salary after taxes, ... etc.'
  //   },
  //   {
  //     matColumnDef: 'currency', matHeaderCellDef: 'Currency',
  //     propertyName: 'currency',
  //     inputPlaceholder: 'Currency', inputType: 'text',
  //     hintText: 'E.g., USD, EGP, ... etc.'
  //   },
  //   {
  //     matColumnDef: 'otherInfo', matHeaderCellDef: 'Other info',
  //     propertyName: 'otherInfo',
  //     inputPlaceholder: 'Other info', inputType: 'text',
  //     hintText: 'Any other info you want to include.'
  //   },
  // ];

  // readonly displayedColumns: string[] = this.columnsConfigs.map(cc => cc.matColumnDef).concat('actionsColumn');
  // readonly dataSource: TableDataSource<TableRow>;
  // persistingNewSalary: boolean = false;
  salariesDBRows: Array<{ dbRow: DBRow<Salary>, editingState: EditingState }>;  // That's a bad name because it's not just salaryDBRow.
  persistingNewSalary: boolean;

  constructor(
    private readonly utilService: UtilService,
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar
  ) {
    // this.dataSource = new TableDataSource<TableRow>(ELEMENT_DATA.map(e => new ExistingRow(new DBRow('', e))), undefined, undefined, { prependNewElements: true })
    // TODO: An ugly hack, adding a row & removing it. Doing that because I don't know how to send a property dataType/constructor.
    // this.dataSource = new TableDataSource<TableRow>([new NewRow(new Salary('', '', '', '', '', ''))], undefined, undefined, { prependNewElements: true })
    // this.dataSource.getRow(0).delete()
    this.salariesDBRows = []
    this.persistingNewSalary = false
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

      // this.dataSource.updateDatasource(succeeded.map(salaryDBRow => new ExistingRow(salaryDBRow)))
      this.salariesDBRows = succeeded.map(salaryDBRow => ({ dbRow: salaryDBRow, editingState: EditingState.NotEditing }))
      this.salariesDBRows.sort((a, b) => this.compareSalaries(a.dbRow.dbRowData, b.dbRow.dbRowData))

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

  async addNewSalary(newSalaryFormComponent: SalaryFormComponent) {
    try {
      this.progressBarService.pushLoading()
      this.persistingNewSalary = true

      const salaryDBRow = await this.dbService.putRow<Salary>(this.profileDatArchive, 'salaries', newSalaryFormComponent.salary)

      this.salariesDBRows.push({ dbRow: salaryDBRow, editingState: EditingState.NotEditing })
      this.salariesDBRows.sort((a, b) => this.compareSalaries(a.dbRow.dbRowData, b.dbRow.dbRowData))

      newSalaryFormComponent.salary = new Salary(this.utilService.getCurrentMonth(), "", "", "", "", "")
    }
    catch (e) {
      this.snackBar.open("Couldn't add new salary for some reason :(", "Dismiss")
    }
    finally {
      this.persistingNewSalary = false
      this.progressBarService.popLoading()
    }
  }

  startEdit(salaryDBRow: { dbRow: DBRow<Salary>, editingState: EditingState }) {
    salaryDBRow.editingState = EditingState.UserEditing
  }

  cancelEdit(salaryDBRow: { dbRow: DBRow<Salary>, editingState: EditingState }) {
    salaryDBRow.editingState = EditingState.NotEditing
  }

  async updateSalary(salaryDBRow: { dbRow: DBRow<Salary>, editingState: EditingState }, updateSalaryFormComponent: SalaryFormComponent) {
    try {
      this.progressBarService.pushLoading()
      salaryDBRow.editingState = EditingState.EditRequestSent

      const updatedSalaryDBRow = await this.dbService.putRow2<Salary>(this.profileDatArchive, 'salaries', updateSalaryFormComponent.salary, salaryDBRow.dbRow.uuid)

      salaryDBRow.dbRow = updatedSalaryDBRow
      salaryDBRow.editingState = EditingState.NotEditing
      this.salariesDBRows.sort((a, b) => this.compareSalaries(a.dbRow.dbRowData, b.dbRow.dbRowData))
    }
    catch (e) {
      this.snackBar.open("Couldn't update the salary for some reason :(", "Dismiss")
      salaryDBRow.editingState = EditingState.UserEditing
    }
    finally {
      this.progressBarService.popLoading()
    }
  }

  /**
   * The index is just for optimization. In most cases, I shouldn't need to loop over the array.
   */
  async deleteSalary(salaryDBRow: { dbRow: DBRow<Salary>, editingState: EditingState }, salaryDBRowIndex: number) {
    try {
      this.progressBarService.pushLoading()
      salaryDBRow.editingState = EditingState.DeleteRequestSent

      await this.dbService.deleteRow<Salary>(this.profileDatArchive, 'salaries', salaryDBRow.dbRow.uuid)

      if (salaryDBRowIndex < this.salariesDBRows.length && this.salariesDBRows[salaryDBRowIndex].dbRow.uuid !== salaryDBRow.dbRow.uuid)
        salaryDBRowIndex = this.salariesDBRows.findIndex(sdbr => sdbr.dbRow.uuid === salaryDBRow.dbRow.uuid)

      // TODO: Add a check that salaryDBRowIndex !== -1
      this.salariesDBRows.splice(salaryDBRowIndex, 1)
    }
    catch (e) {
      console.log(e)
      this.snackBar.open("Couldn't delete the salary for some reason :(", "Dismiss")
      salaryDBRow.editingState = EditingState.NotEditing
    }
    finally {
      this.progressBarService.popLoading()
    }
  }

  /**
   * TODO: sort by creationDate when you add it isA
   */
  private compareSalaries(a: Salary, b: Salary): number {
    if (a.month < b.month)
      return 1
    if (a.month > b.month)
      return -1
    return 0  // Actually, in C++ this would blow up because it must mean a === b. But according to JS docs, I think it means either
              // "don't change the relative order", or in some browsers, undefined/don't-care relative order.
  }

  // salary(row: TableRow): Salary {
  //   switch (row.kind) {
  //     case TableRowKind.ExistingRow: return row.salaryDBRow.dbRowData
  //     case TableRowKind.NewRow: return row.salary
  //     default: return UtilService.assertNever(row)
  //   }
  // }
  //
  // /**
  //  * Credits: https://github.com/irossimoline/angular4-material-table/issues/6#issuecomment-359479471
  //  */
  // createNewWithDefaultValues() {
  //   this.dataSource.createNew()
  //   const row = this.dataSource.getRow(-1)
  //   row.currentData = new NewRow(new Salary(UtilService.getCurrentMonth(), '', '', '', '', ''))
  // }
  //
  // async delete(row: TableElement<ExistingRow>) {
  //   row.currentData = new ExistingRow(row.currentData.salaryDBRow, true)
  //   await this.dbService.deleteRow(this.profileDatArchive, 'salaries', row.currentData.salaryDBRow.uuid)
  //   row.delete()
  // }
  //
  // async confirmEditCreate(row: TableElement<TableRow>) {
  //   switch (row.currentData.kind) {
  //     case TableRowKind.ExistingRow: {
  //       row.currentData = new ExistingRow(row.currentData.salaryDBRow, true)
  //       const salaryDBRow = await this.dbService.putRow2<Salary>(this.profileDatArchive, 'salaries', row.currentData.salaryDBRow.dbRowData, row.currentData.salaryDBRow.uuid)
  //       row.currentData = new ExistingRow(salaryDBRow, false)
  //       break;
  //     }
  //     case TableRowKind.NewRow: {
  //       this.persistingNewSalary = true;
  //       row.currentData = new NewRow(row.currentData.salary, true)
  //       const salaryDBRow = await this.dbService.putRow<Salary>(this.profileDatArchive, 'salaries', row.currentData.salary)
  //       row.currentData = new ExistingRow(salaryDBRow, false)
  //       this.persistingNewSalary = false;
  //       break;
  //     }
  //     default: UtilService.assertNever(row.currentData)
  //   }
  //   // TODO: If we add validation later on, we need to check on this call's return value first.
  //   row.confirmEditCreate()
  // }
}

// Yup, yup, not so clean of a design
enum EditingState { NotEditing, UserEditing, EditRequestSent, DeleteRequestSent }

/**
 * Either a new Salary, or a DBRow of an existing salary
 */
// type TableRow = ExistingRow | NewRow
//
// enum TableRowKind { ExistingRow, NewRow }
//
// class ExistingRow {
//   constructor(
//     readonly salaryDBRow: DBRow<Salary>,
//     readonly locked: boolean = false,
//     readonly kind: TableRowKind.ExistingRow = TableRowKind.ExistingRow
//   ) { }
// }
//
// class NewRow {
//   constructor(
//     readonly salary: Salary,
//     readonly locked: boolean = false,
//     readonly kind: TableRowKind.NewRow = TableRowKind.NewRow
//   ) { }
// }
