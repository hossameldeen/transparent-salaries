import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from '@angular/router';

/**
 * I didn't take into account the possibility of component reuse. So, the quickest fix is just to disable it.
 *
 * See:
 *   (1) https://angular.io/guide/router#observable-parammap-and-component-reuse
 *   (2) https://github.com/angular/angular/issues/20993
 *   (3) https://stackoverflow.com/a/41515648/6690391
 */
export class DisableRouteReuseStrategy extends RouteReuseStrategy{
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return false;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
  }
}
