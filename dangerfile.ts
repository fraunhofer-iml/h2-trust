/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { danger, fail, warn } from 'danger';

(async () => {
  const pr = danger.github.pr;
  const isDependabot = pr.user.login === 'dependabot[bot]';

  const touchedFiles = [...danger.git.modified_files, ...danger.git.created_files];
  const hasSpecFiles = touchedFiles.some((f) => f.endsWith('.spec.ts'));
  const hasSmartContractChanges = touchedFiles.some((f) => f.endsWith('.sol'));
  const hasArtifactChanges = touchedFiles.some((f) => f.startsWith('docker/') && f.endsWith('.json'));
  const hasPackageJson = touchedFiles.includes('package.json');
  const hasPackageLock = touchedFiles.includes('package-lock.json');

  if (pr.draft) {
    fail('Remove the Draft status before requesting review.');
  }

  if (!isDependabot) {
    const CONVENTIONAL_TYPES = [
      'build',
      'chore',
      'ci',
      'docs',
      'feat',
      'fix',
      'perf',
      'refactor',
      'revert',
      'style',
      'test',
    ];
    const match = pr.title.match(/^(\w+)(\(.+\))?!?: /);
    const conventionalType = match?.[1];

    if (!conventionalType || !CONVENTIONAL_TYPES.includes(conventionalType)) {
      fail(
        `Follow the Conventional Commits format in the PR title (e.g. \`feat: add login\`). Valid types: ${CONVENTIONAL_TYPES.join(', ')}`,
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
      fail('Assign at least one person to this pull request.');
    }

    if (!pr.body || pr.body.trim().length < 10) {
      fail('Add a meaningful description to this pull request.');
    }
  }

  if (hasSmartContractChanges && !hasArtifactChanges) {
    warn('Smart contract modified without an artifact update. Did you forget to run `npx hardhat compile`?');
  }

  if (hasPackageJson && !hasPackageLock) {
    warn(
      '`package.json` was modified without updating `package-lock.json`. Please run `npm install` and commit the lockfile.',
    );
  }
})();
