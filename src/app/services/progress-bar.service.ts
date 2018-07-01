import { Injectable } from '@angular/core';

/**
 * TODO: technical debt. What if a caller forgets to call `loadingFinished()`, for example, due to an exception thrown?
 */
@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {

  /**
   * TODO: Exposing the variable like that has a bad side: a component/caller could mistakenly change it :(
   */
  showProgressBar: boolean = false;

  private ctr;

  constructor() { }

  pushLoading() {
    if (this.ctr++ === 0)
      this.showProgressBar = true 
  }

  popLoading() {
    if (this.ctr-- === 0)
      this.showProgressBar = false
  }
}
