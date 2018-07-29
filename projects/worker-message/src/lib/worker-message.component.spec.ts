import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerMessageComponent } from './worker-message.component';

describe('WorkerMessageComponent', () => {
  let component: WorkerMessageComponent;
  let fixture: ComponentFixture<WorkerMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
