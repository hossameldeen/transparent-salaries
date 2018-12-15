import { Component, Input, OnInit } from '@angular/core';
import { Salary, encode as encodeSalary, decode as decodeSalary } from 'src/app/models/salary.model';
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
  salariesDBRows: Array<{ dbRow: DBRow<Salary>, editingState: EditingState }>;  // That's a bad name because it's not just salaryDBRow.
  nextStart: number;
  lastTotalCount: number;
  loadingSalaries: boolean;
  persistingNewSalary: boolean;

  constructor(
    private readonly utilService: UtilService,
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar
  ) {
    this.salariesDBRows = []
    this.nextStart = 0;
    this.lastTotalCount = 1  // any number > 0 to have the button
    this.loadingSalaries = false
    this.persistingNewSalary = false
  }

  ngOnInit() {
    this.loadMoreSalaries() // Note: It's a fire-and-forget
  }

  async loadMoreSalaries(): Promise<void> {

    this.progressBarService.pushLoading()
    this.loadingSalaries = true

    try {
      const { entries, totalCount } = (await this.dbService.readAllRows<Salary>(this.profileDatArchive, 'salaries', decodeSalary,
        { reverse: true, start: this.nextStart, count: 10 }))

      this.nextStart = this.nextStart + entries.length
      this.lastTotalCount = totalCount

      const succeeded: Array<DBRow<Salary>> = []
      let atLeastOneFailed = false
      for (const salaryOrFailure of entries) {
        if (salaryOrFailure.status === 'succeeded')
          succeeded.push(salaryOrFailure.row)
        else
          atLeastOneFailed = true
      }

      this.salariesDBRows = this.salariesDBRows.concat(succeeded.map(salaryDBRow => ({ dbRow: salaryDBRow, editingState: EditingState.NotEditing })))

      if (atLeastOneFailed)
        this.snackBar.open("Couldn't retrieve some salaries from the profile. That's all I know :(", "Dismiss")
    }
    catch(e) {
      this.snackBar.open("Couldn't retrieve salaries from the profile. That's all I know :(", "Dismiss")
    }
    finally {
      this.progressBarService.popLoading()
      this.loadingSalaries = false
    }
  }

  async addNewSalary(newSalaryFormComponent: SalaryFormComponent) {
    try {
      this.progressBarService.pushLoading()
      this.persistingNewSalary = true

      const salaryDBRow = await this.dbService.putRow<Salary>(this.profileDatArchive, 'salaries', newSalaryFormComponent.salary, encodeSalary)

      this.salariesDBRows.unshift({ dbRow: salaryDBRow, editingState: EditingState.NotEditing })

      newSalaryFormComponent.salary = new Salary(this.utilService.getCurrentMonth(), "", "", "", "", "", Date.now().toString())
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

      const updatedSalaryDBRow = await this.dbService.putRow2<Salary>(this.profileDatArchive, 'salaries', updateSalaryFormComponent.salary, salaryDBRow.dbRow.uuid, encodeSalary)

      salaryDBRow.dbRow = updatedSalaryDBRow
      salaryDBRow.editingState = EditingState.NotEditing
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
      this.snackBar.open("Couldn't delete the salary for some reason :(", "Dismiss")
      salaryDBRow.editingState = EditingState.NotEditing
    }
    finally {
      this.progressBarService.popLoading()
    }
  }
}

// Yup, yup, not so clean of a design
enum EditingState { NotEditing, UserEditing, EditRequestSent, DeleteRequestSent }
