import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

/**
 * TODO: technical debt. What if a caller forgets to call `loadingFinished()`, for example, due to an exception thrown?
 * Probably should create this function:
 * wrapLoading(cb) {
 *     this.pushLoading()
 *     try {
 *         cb()
 *     }
 *     catch(e) {
 *         this.popLoading()
 *         throw e
 *     }
 *     this.popLoading()
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {

  showProgressBarSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private ctr = 0;

  constructor() { }

  pushLoading() {
    if (this.ctr++ === 0)
      this.showProgressBarSubject.next(true)
  }

  popLoading() {
    if (--this.ctr === 0)
      this.showProgressBarSubject.next(false)
  }
}
