import { Component, Input } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { Salary } from 'src/app/models/salary.model';

@Component({
  selector: 'app-salary-form',
  templateUrl: './salary-form.component.html',
  styleUrls: ['./salary-form.component.css']
})
export class SalaryFormComponent {

  @Input() disabled: boolean;
  salary: Salary;

  constructor(utilService: UtilService) {
    this.salary = new Salary(utilService.getCurrentMonth(), "", "", "", "", "")
  }

  onInput($event: Event, fieldPropertyName: string) {
    this.salary[fieldPropertyName] = ($event.target as HTMLInputElement).value
  }

}
