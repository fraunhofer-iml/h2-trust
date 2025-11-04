/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { danger, fail, message } from 'danger';

const pr = danger.github.pr;

// Ensure package-lock.json is updated when package.json is changed
if (danger.git.modified_files.includes('package.json') && !danger.git.modified_files.includes('package-lock.json')) {
  message(
    'Changes were made to package.json, but not to package-lock.json. Please run `npm install` and commit the lockfile.',
  );
}

// Prevent draft PR from being reviewed
if (pr.draft) {
  fail('Pull request is marked as Draft. Please remove this before requesting review.');
}

// Enforce assignee
if (!pr.assignees || pr.assignees.length === 0) {
  fail('Pull request needs an assignee.');
}

// Enforce description
if (!pr.body || pr.body.trim().length < 10) {
  fail('Pull request needs a meaningful description.');
}
