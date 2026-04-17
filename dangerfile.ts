/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { danger, fail, message } from 'danger';

const pr = danger.github.pr;
const isDependabot = pr.user.login === 'dependabot[bot]';

const CONVENTIONAL_TYPES = ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'];

if (!isDependabot) {
  const match = pr.title.match(/^(\w+)(\(.+\))?!?: /);
  const conventionalType = match?.[1];

  if (!conventionalType || !CONVENTIONAL_TYPES.includes(conventionalType)) {
    fail(
      `PR title must follow Conventional Commits format (e.g. \`feat: add login\`). Valid types: ${CONVENTIONAL_TYPES.join(', ')}`,
    );
  } else {
    await danger.github.api.issues.addLabels({
      owner: danger.github.thisPR.owner,
      repo: danger.github.thisPR.repo,
      issue_number: pr.number,
      labels: [conventionalType],
    });
  }
}

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
if (!isDependabot && (!pr.assignees || pr.assignees.length === 0)) {
  fail('Pull request needs an assignee.');
}

// Enforce description
if (!isDependabot && (!pr.body || pr.body.trim().length < 10)) {
  fail('Pull request needs a meaningful description.');
}
