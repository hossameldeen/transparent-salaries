import { Component, Input, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { Salary, encode as encodeSalary, decode as decodeSalary } from 'src/app/models/salary.model';

@Component({
  selector: 'app-salary-form',
  templateUrl: './salary-form.component.html',
  styleUrls: ['./salary-form.component.css']
})
export class SalaryFormComponent implements OnInit {

  @Input() initialSalary: Salary;
  @Input() disabled: boolean;
  salary: Salary;

  constructor(readonly utilService: UtilService) { }

  ngOnInit() {
    this.salary = this.initialSalary || new Salary(this.utilService.getCurrentMonth(), "", "", "", "", "")
  }

  onInput($event: Event, fieldPropertyName: string) {
    this.salary[fieldPropertyName] = ($event.target as HTMLInputElement).value
  }

}
