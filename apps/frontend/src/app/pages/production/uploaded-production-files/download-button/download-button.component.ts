/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionService } from 'apps/frontend/src/app/shared/services/production/production.service';
import { toast } from 'ngx-sonner';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { DownloadFilesDto, ProcessedCsvDto } from '@h2-trust/api';

@Component({
  selector: 'app-download-button',
  imports: [CommonModule, MatBadgeModule, MatButtonModule],
  templateUrl: './download-button.component.html',
})
export class DownloadButtonComponent {
  selectedFiles = input.required<SelectionModel<ProcessedCsvDto>>();

  productionService = inject(ProductionService);

  downloadMutation = injectMutation(() => ({
    mutationFn: async (dto: DownloadFilesDto) => {
      const promise: Promise<Blob> = this.productionService.downloadFiles(dto);
      toast.promise(promise, {
        loading: 'Fetching Files...',
        success: 'Download Successfull',
        error: (error): string => {
          if (error instanceof HttpErrorResponse) {
            return `Failed to fetch files: ${error.statusText}`;
          }
          return 'Failed to fetch files';
        },
      });
      const download = await promise;
      const blobUrl = URL.createObjectURL(download);
      this.saveFile(blobUrl, 'download.zip');
      URL.revokeObjectURL(blobUrl);
    },
  }));

  async downloadSelected() {
    const files = this.selectedFiles().selected;

    if (!files || files.length === 0) return;

    if (files.length === 1) {
      const { url, name } = files[0];
      this.saveFile(url, name);
    } else {
      const dto: DownloadFilesDto = { ids: files.map((f) => f.name) };
      this.downloadMutation.mutate(dto);
    }
  }

  private saveFile(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
