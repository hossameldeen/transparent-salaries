import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  private active: SnackBarOpenParameters | null;
  private queue: Array<SnackBarOpenParameters>;

  constructor(private readonly snackBar: MatSnackBar) {
    this.active = null
    this.queue = []
  }

  openQueued(message: string, action?: string, config?: MatSnackBarConfig): void {
    this.queue.push(new SnackBarOpenParameters(message, action, config))
    if (this.active === null)
      this.openNext()
  }

  private openNext() {
    const params = this.queue.shift()

    if (typeof params === 'undefined') {
      this.active = null
    }
    else {
      this.snackBar.open(params.message, params.action, params.config)
        .afterDismissed().subscribe(() => this.openNext())
      this.active = params
    }
  }
}

class SnackBarOpenParameters {
  constructor(
    readonly message: string,
    readonly action?: string,
    readonly config?: MatSnackBarConfig
  ) { }
}
