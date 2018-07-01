import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * TODO: technical debt. What if a caller forgets to call `loadingFinished()`, for example, due to an exception thrown?
 */
@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {

  private progressBarSubject: Subject<{ showProgressBar: boolean }> = new Subject<{ showProgressBar: boolean}>();
  progressBarObservable: Observable<{ showProgressBar: boolean }> = this.progressBarSubject.asObservable();
  private ctr;

  constructor() { }

  pushLoading() {
    if (this.ctr++ === 0)
      this.progressBarSubject.next({ showProgressBar: true }) 
  }

  popLoading() {
    if (this.ctr-- === 0)
      this.progressBarSubject.next({ showProgressBar: false }) 
  }
}
