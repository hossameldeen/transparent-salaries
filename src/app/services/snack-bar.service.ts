import {Component, Inject, Injectable} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material';
import {UtilService} from './util.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  private active: SnackBarParams | null;
  private queue: Array<SnackBarParams>;

  constructor(private readonly snackBar: MatSnackBar) {
    this.active = null
    this.queue = []
  }

  openQueued(message: string, action?: string, config?: MatSnackBarConfig): void {
    this.queue.push(new OpenParams(message, action, config))
    if (this.active === null)
      this.openNext()
  }

  openQueuedSupportDismiss(message: string): void {
    this.queue.push(new SupportDismissParams(message))
    if (this.active === null)
      this.openNext()
  }

  private openNext() {
    const params = this.queue.shift()

    if (typeof params === 'undefined') {
      this.active = null
    }
    else {
      switch (params.kind) {
        case SnackBarParamsKind.OpenParams:
          this.snackBar.open(params.message, params.action, params.config)
            .afterDismissed().subscribe(() => this.openNext())
          break;
        case SnackBarParamsKind.SupportDismissParams:
          this.snackBar.openFromComponent(SnackBarSupportDismissComponent, { data: { message: params.message }})
            .afterDismissed().subscribe(() => this.openNext())
          break;
        default: UtilService.assertNever(params)
      }
      this.active = params
    }
  }
}

/**
 * Put it here instead of in `components/` because this is very specific to here. May move later.
 */
@Component({
  selector: 'app-snackbar-support-dismiss',
  template: `
    <!-- TODO: Not good to depend on material's classes that way -->
    <div class='mat-simple-snackbar'>
      <span>{{data.message}}</span>
      <div class="mat-simple-snackbar-action">
        <button mat-button (click)="goToSupport()">Go to Support</button>
        <button mat-button (click)="dismiss()">Dismiss</button>
      </div>
    </div>
  `
})
export class SnackBarSupportDismissComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<SnackBarSupportDismissComponent>,
    @Inject(MAT_SNACK_BAR_DATA) readonly data: any,
    readonly router: Router
  ) { }

  goToSupport() {
    this.snackBarRef.dismissWithAction()
    this.router.navigateByUrl('/support')
  }

  dismiss() {
    // Yes, for consistency with MatSnackBar.open, both should be dismissWithAction
    this.snackBarRef.dismissWithAction()
  }
}

type SnackBarParams = OpenParams | SupportDismissParams

enum SnackBarParamsKind { OpenParams, SupportDismissParams }

class OpenParams {
  constructor(
    readonly message: string,
    readonly action?: string,
    readonly config?: MatSnackBarConfig,
    readonly kind: SnackBarParamsKind.OpenParams = SnackBarParamsKind.OpenParams
  ) { }
}

class SupportDismissParams {
  constructor(
    readonly message: string,
    readonly kind: SnackBarParamsKind.SupportDismissParams = SnackBarParamsKind.SupportDismissParams
  ) { }
}
