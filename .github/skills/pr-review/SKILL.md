---
name: pr-review
description: "PR review workflow for the Conscius project. USE WHEN: user opens a pull request, asks to check CI status, mentions SonarCloud or Sourcery feedback, asks if a PR is ready to merge, or needs to resolve a merge conflict. EXAMPLES: 'check if the PR is ready', 'CI failed on my PR', 'SonarCloud flagged something', 'is this ready to merge?', 'fix merge conflict', 'review PR feedback'."
---

# PR review workflow

## Current state

- **Branch:** !`git branch --show-current`
- **Remote status:** !`git status -sb | head -1`
- **Recent commits:** !`git log --oneline -3`

## User instructions

$ARGUMENTS

---

After opening any PR, **proactively** fetch CI/CD feedback before declaring work ready to merge. Do not wait to be asked.

## Checkpoints

| Checkpoint                        | Action                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| After pushing a task branch       | Check CI run status via `list_workflow_runs`                                                                      |
| After opening a PR                | Poll `get_check_runs` until CI passes or fails                                                                    |
| Before recommending merge         | Read PR comments for SonarCloud quality gate and Sourcery AI review; fix any flagged bugs/vulnerabilities         |
| Before opening an epic PR to main | Verify all task PRs merged cleanly; run full suite locally (`npx nx run-many -t typecheck,lint,test,build --all`) |

## Tools

- `github-mcp-server-actions_list` — list workflow runs and their status
- `github-mcp-server-pull_request_read` with `get_check_runs` — check CI pass/fail on a PR
- `github-mcp-server-issue_read` with `get_comments` — read SonarCloud and Sourcery bot feedback
- `github-mcp-server-get_job_logs` — fetch logs for failed CI jobs

## Bot feedback to action

**SonarCloud:**

- Quality Gate must be **Passed** before merge
- **Bugs / Vulnerabilities** — fix before merge (blocking)
- **Security Hotspots** — review and either fix or mark as reviewed with justification
- **Code Smells** — fix if straightforward; log as a backlog task if complex

**Sourcery AI:**

- Fix anything flagged as a bug risk
- Log non-trivial architectural suggestions as backlog tasks

## Merge conflict check

Always check `mergeable_state` from `pull_request_read` (method: `get`).

If `mergeable_state` is `"dirty"`:

```bash
git checkout <task-branch>
git rebase origin/<base-branch>
# resolve any conflicts, then:
git rebase --continue
git push --force-with-lease
```

**Do not declare a PR ready to merge if `mergeable_state` is anything other than `"clean"`.**

## CI auto-commit pattern (known issue)

After every push to `main`, GitHub Actions auto-commits `chore(changelog): update CHANGELOG.md [skip ci]`, causing non-fast-forward rejections on the next local push. Fix:

```bash
git pull --rebase && git push
```
