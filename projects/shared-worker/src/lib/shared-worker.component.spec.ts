import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedWorkerComponent } from './shared-worker.component';

describe('SharedWorkerComponent', () => {
  let component: SharedWorkerComponent;
  let fixture: ComponentFixture<SharedWorkerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedWorkerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
