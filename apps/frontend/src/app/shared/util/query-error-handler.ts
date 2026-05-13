/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';

interface ProblemDetail {
  type: string;
  status: number;
  title: string;
  detail: string;
  instance: string;
  timestamp: string;
  validationErrors?: string[];
}

function isProblemDetail(value: unknown): value is ProblemDetail {
  if (!value || typeof value !== 'object') return false;

  const p = value as Record<string, unknown>;

  return (
    ['type', 'title', 'detail', 'instance', 'timestamp'].every((key) => typeof p[key] === 'string') &&
    typeof p['status'] === 'number' &&
    (p['validationErrors'] === undefined ||
      (Array.isArray(p['validationErrors']) && p['validationErrors'].every((e) => typeof e === 'string')))
  );
}

export function toastQueryError(err: unknown, toastId?: string | number) {
  if (err instanceof HttpErrorResponse && isProblemDetail(err.error)) {
    const validationErrors = err.error.validationErrors;
    const description =
      validationErrors && validationErrors.length > 0 ? validationErrors.join(', ') : err.error.detail;

    toast.error(err.error.title, { description: description });
    return;
  }

  if (err instanceof HttpErrorResponse) {
    toast.error('Request failed', { id: toastId, description: err.message });
    return;
  }

  toast.error('Request failed', { id: toastId });
}

export async function handleMutationWithPromiseToast<T>(promise: Promise<T>, successMessage: string): Promise<T> {
  const id = toast.loading('Processing request...');

  try {
    const resolved = await promise;
    toast.success(successMessage, {
      id,
    });
    return resolved;
  } catch (error) {
    toastQueryError(error, id);
    throw error;
  }
}
