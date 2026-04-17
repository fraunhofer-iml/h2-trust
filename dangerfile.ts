/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { danger, fail, message, warn } from 'danger';

const pr = danger.github.pr;
const isDependabot = pr.user.login === 'dependabot[bot]';

const modifiedFiles = danger.git.modified_files;
const hasSpecFiles = modifiedFiles.some((f) => f.endsWith('.spec.ts'));
const hasSmartContractChanges = modifiedFiles.some((f) => f.endsWith('.sol'));
const hasArtifactChanges = modifiedFiles.some((f) => f.startsWith('docker/') && f.endsWith('.json'));
const hasPackageJson = modifiedFiles.includes('package.json');
const hasPackageLock = modifiedFiles.includes('package-lock.json');

if (pr.draft) {
  fail('Pull request is marked as Draft. Please remove this before requesting review.');
}

if (!isDependabot) {
  const CONVENTIONAL_TYPES = ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'];
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

    if (conventionalType === 'feat' && !hasSpecFiles) {
      warn('No test files modified. Consider adding or updating tests for this feature.');
    }
  }

  if (!pr.assignees || pr.assignees.length === 0) {
    fail('Pull request needs an assignee.');
  }

  if (!pr.body || pr.body.trim().length < 10) {
    fail('Pull request needs a meaningful description.');
  }
}

if (hasSmartContractChanges && !hasArtifactChanges) {
  warn('Smart contract modified but no artifact updated. Did you forget to run `npx hardhat compile`?');
}

if (hasPackageJson && !hasPackageLock) {
  message(
    'Changes were made to package.json, but not to package-lock.json. Please run `npm install` and commit the lockfile.',
  );
}
