import type { HttpErrorResponse } from '@angular/common/http';

declare module '@tanstack/query-core' {
  interface Register {
    defaultError: HttpErrorResponse;
  }
}
