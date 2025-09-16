/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { danger, fail, markdown, message } from 'danger';

// ENFORCE LOCKFILE UP TO DATE
const packageFileChanged = danger.git.modified_files.includes('package.json');
const lockFileChanged = danger.git.modified_files.includes('package-lock.json');
if (packageFileChanged && !lockFileChanged) {
  message(
    'Changes were made to package.json, but not to package-lock.json. Please run `npm install` and commit the lockfile.',
  );
}

// PREVENT DRAFT MRs
if (/\b(Draft)\b/i.test(danger.gitlab.mr.title)) {
  fail('Merge Request is marked as Draft. Please remove this before requesting review.');
}

// ENFORCE ASSIGNEE
if (!danger.gitlab.mr.assignee || danger.gitlab.mr.assignee.length === 0) {
  fail('This merge request needs an assignee.');
}

// ENFORCE REVIEWER
if (!danger.gitlab.mr.reviewers || danger.gitlab.mr.reviewers.length === 0) {
  fail('This merge request needs at least one reviewer.');
}

// ENFORCE MR DESCRIPTION
if (!danger.gitlab.mr.description || danger.gitlab.mr.description.trim().length < 10) {
  fail('This merge request needs a meaningful description.');
}

// ENCOURAGE SMALLER MRs
const changesCounter = parseInt(danger.gitlab.mr.changes_count, 10);
if (changesCounter > 50) {
  message(`:exclamation: Big Merge Request (${changesCounter} files changed)`);
  markdown(
    `> (The merge request size seems relatively large. If the merge request contains multiple changes, splitting them into separate MRs will help with faster and easier review.`,
  );
}

// REQUIRE TEST CHANGES FOR CODE CHANGES
const relevantFiles = danger.git.modified_files.concat(danger.git.created_files);
const sourceFilesChanged = relevantFiles.some((f) => f.startsWith('apps/') || f.startsWith('libs/'));
const testFilesChanged = relevantFiles.some((f) => /test|spec/i.test(f));
if (sourceFilesChanged && !testFilesChanged) {
  message('Source code was changed, but no test code was updated. Please consider adding or updating tests.');
}
