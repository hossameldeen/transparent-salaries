import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { Salary } from 'src/app/models/salary.model';

@Component({
  selector: 'app-salary-form',
  templateUrl: './salary-form.component.html',
  styleUrls: ['./salary-form.component.css']
})
export class SalaryFormComponent implements OnInit {

  //         <input matInput placeholder="{{cc.placeholder}}" type="{{cc.inputType}}" [value]="salary(row.currentData)[cc.propertyName]" (input)="salary(row.currentData)[cc.propertyName]=$event.target.value" [disabled]="row.currentData.locked">
  readonly salary: Salary;

  constructor(utilService: UtilService) {
    this.salary = new Salary(utilService.getCurrentMonth(), "", "", "", "", "")
  }

  ngOnInit() {
  }

  onInput($event: Event, fieldPropertyName: string) {
    this.salary[fieldPropertyName] = ($event.target as HTMLInputElement).value
  }

}
