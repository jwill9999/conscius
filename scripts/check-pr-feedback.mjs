#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : null;
}

function hasFlag(name) {
  return args.includes(name);
}

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' });
}

function runGhJson(args) {
  return JSON.parse(runGh(args));
}

function getCurrentBranch() {
  return execFileSync('git', ['branch', '--show-current'], {
    encoding: 'utf8',
  }).trim();
}

function resolvePrIdentifier() {
  const pr = getArg('--pr');

  if (pr) {
    return pr;
  }

  const branch = getArg('--branch') ?? getCurrentBranch();
  return branch;
}

function summarizeChecks(checks) {
  const byName = new Map();
  const failedStates = new Set([
    'FAIL',
    'FAILURE',
    'ERROR',
    'TIMED_OUT',
    'CANCELLED',
  ]);
  const pendingStates = new Set([
    'PENDING',
    'STARTUP_REQUIRED',
    'WAITING',
    'QUEUED',
    'IN_PROGRESS',
  ]);

  for (const check of checks) {
    byName.set(check.name, check);
  }

  return {
    total: checks.length,
    failed: checks.filter((check) => failedStates.has(check.state)).length,
    pending: checks.filter((check) => pendingStates.has(check.state)).length,
    sonarqube: byName.get('SonarCloud Code Analysis') ?? null,
    sourcery: byName.get('Sourcery review') ?? null,
  };
}

function filterComments(comments, login) {
  return comments.filter((comment) => comment.user?.login === login);
}

function buildOutput(pr, checks, issueComments, reviewComments, reviews) {
  const summary = summarizeChecks(checks);
  const sonarComments = filterComments(issueComments, 'sonarqubecloud[bot]');
  const sourceryIssueComments = filterComments(
    issueComments,
    'sourcery-ai[bot]',
  );
  const sourceryReviewComments = filterComments(
    reviewComments,
    'sourcery-ai[bot]',
  );
  const sourceryReviews = filterComments(reviews, 'sourcery-ai[bot]');

  return {
    pr: {
      number: pr.number,
      title: pr.title,
      url: pr.url,
      headRefName: pr.headRefName,
      baseRefName: pr.baseRefName,
      reviewDecision: pr.reviewDecision ?? null,
    },
    checks: summary,
    comments: {
      sonarIssueCommentCount: sonarComments.length,
      sourceryIssueCommentCount: sourceryIssueComments.length,
      sourceryReviewCommentCount: sourceryReviewComments.length,
      sourceryReviewCount: sourceryReviews.length,
    },
    findings: {
      sonarQualityGateFailed:
        summary.sonarqube != null &&
        ['FAIL', 'FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED'].includes(
          summary.sonarqube.state,
        ),
      sonarMentionsSecurityHotspot: sonarComments.some((comment) =>
        comment.body.includes('Security Hotspot'),
      ),
      sourceryHasReviewComments: sourceryReviewComments.length > 0,
    },
  };
}

function printHuman(output) {
  const { pr, checks, comments, findings } = output;
  const lines = [
    `PR #${pr.number}: ${pr.title}`,
    pr.url,
    `Branch: ${pr.headRefName} -> ${pr.baseRefName}`,
    `Review decision: ${pr.reviewDecision ?? 'none'}`,
    '',
    `Checks: ${checks.total} total, ${checks.failed} failed, ${checks.pending} pending`,
    `- SonarCloud: ${checks.sonarqube?.state ?? 'not found'}`,
    `- Sourcery: ${checks.sourcery?.state ?? 'not found'}`,
    '',
    'Comments:',
    `- Sonar issue comments: ${comments.sonarIssueCommentCount}`,
    `- Sourcery issue comments: ${comments.sourceryIssueCommentCount}`,
    `- Sourcery review comments: ${comments.sourceryReviewCommentCount}`,
    `- Sourcery reviews: ${comments.sourceryReviewCount}`,
    '',
    'Findings:',
    `- Sonar quality gate failed: ${findings.sonarQualityGateFailed ? 'yes' : 'no'}`,
    `- Sonar mentions security hotspot: ${findings.sonarMentionsSecurityHotspot ? 'yes' : 'no'}`,
    `- Sourcery has review comments: ${findings.sourceryHasReviewComments ? 'yes' : 'no'}`,
  ];

  console.log(lines.join('\n'));
}

function main() {
  const identifier = resolvePrIdentifier();
  const pr = runGhJson([
    'pr',
    'view',
    identifier,
    '--json',
    'number,title,url,headRefName,baseRefName,reviewDecision',
  ]);

  const issueComments = runGhJson([
    'api',
    `repos/jwill9999/conscius/issues/${pr.number}/comments`,
  ]);
  const reviewComments = runGhJson([
    'api',
    `repos/jwill9999/conscius/pulls/${pr.number}/comments`,
  ]);
  const reviews = runGhJson([
    'api',
    `repos/jwill9999/conscius/pulls/${pr.number}/reviews`,
  ]);
  const checks = runGhJson([
    'pr',
    'checks',
    String(pr.number),
    '--json',
    'name,state,link',
  ]);

  const output = buildOutput(
    pr,
    checks,
    issueComments,
    reviewComments,
    reviews,
  );

  if (hasFlag('--json')) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  printHuman(output);
}

main();
