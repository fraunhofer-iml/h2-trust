/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink],
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly navigationTick = signal(0);

  protected readonly breadcrumbs = computed(() => {
    this.navigationTick();
    return this.collectBreadcrumbs();
  });

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.navigationTick.update((value) => value + 1);
      });
  }

  private collectBreadcrumbs(): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentRoute: ActivatedRoute | null = this.activatedRoute.root;
    let currentUrl = '';

    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
      const routeUrl = currentRoute.snapshot.url.map((segment) => segment.path).join('/');

      if (routeUrl) {
        currentUrl = `${currentUrl}/${routeUrl}`;
      }

      const breadcrumb = currentRoute.snapshot.data['breadcrumb'];
      if (typeof breadcrumb === 'string' && breadcrumb.trim().length > 0) {
        const normalizedLabel = breadcrumb.trim();
        const previousBreadcrumb = breadcrumbs.at(-1);

        const routePath = currentRoute.routeConfig?.path ?? '';
        if (
          normalizedLabel.toLowerCase() === 'edit' &&
          routePath.includes(':id/edit') &&
          currentUrl.endsWith('/edit')
        ) {
          const detailsUrl = currentUrl.slice(0, -'/edit'.length);
          if (detailsUrl && previousBreadcrumb?.url !== detailsUrl) {
            breadcrumbs.push({
              label: 'Details',
              url: detailsUrl,
            });
          }
        }

        if (previousBreadcrumb?.label.toLowerCase() === normalizedLabel.toLowerCase()) {
          continue;
        }

        breadcrumbs.push({
          label: normalizedLabel,
          url: currentUrl || '/',
        });
      }
    }

    return breadcrumbs;
  }
}
