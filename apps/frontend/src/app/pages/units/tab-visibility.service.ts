import { filter } from 'rxjs';
import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TabVisibilityService {
  showTabs = signal<boolean>(true);

  constructor(private router: Router) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      const navEnd = e as NavigationEnd;
      const url = navEnd.urlAfterRedirects || navEnd.url;

      const segments = url.split('/');
      const visible = segments[segments.length - 2] === 'units';

      this.showTabs.set(visible);
    });
  }
}
