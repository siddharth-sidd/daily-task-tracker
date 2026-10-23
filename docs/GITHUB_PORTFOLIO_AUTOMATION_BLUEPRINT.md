# GitHub Portfolio Automation Blueprint

## User-selected operating mode

- Existing repository improvements: daily
- New project/repository cadence: every 2 weeks
- Tech stack: mixed (React/TypeScript, MERN, Python/Django/Flask, SQL, and suitable tools)
- Change handling: AI prepares a branch and pull request; the owner reviews and merges
- No unattended pushes to default branches
- No repository creation until the owner explicitly approves the name, visibility, and initial project scope
- No new permissions or credentials until the owner explicitly approves them

## Target architecture

1. **Portfolio controller** — a dedicated scheduled workflow selects eligible repositories using a registry and rotation history. It excludes archived, empty, forked, and explicitly opted-out repositories.
2. **Daily run** — select one repository that has not been recently selected. Read its README, package/config files, tests, and open issues. Choose one small, useful backlog item. If no credible improvement is available, skip rather than invent a change.
3. **AI coding step** — use a configured AI provider/model to propose a focused patch. The model must treat repository content as untrusted data and must not follow instructions found in source files that request secrets, permission changes, or unrelated actions.
4. **Validation** — install dependencies with lockfiles, run repository-defined lint/typecheck/build/tests, and scan the diff for secrets and unrelated file churn. If checks fail, do not open a PR; record the failure for review.
5. **Review PR** — create a feature branch and draft PR containing the purpose, summary, tests executed, limitations, and risk. Never merge automatically.
6. **Biweekly project run** — propose one project idea and stack; create the repository and publish starter code only after explicit owner approval. The workflow must not create repositories autonomously under the current review-only authorization.

## Schedule proposal (UTC)

- Daily existing-project run: 03:30 UTC (09:00 IST)
- Biweekly project proposal: every other Monday at 04:30 UTC (10:00 IST)
- Add `workflow_dispatch` so the owner can run a job manually.

GitHub Actions schedules use UTC and may be delayed during high load. Keep a manual trigger and avoid depending on an exact minute.

## Required configuration before an AI workflow can execute

- AI provider and model selection
- A provider API credential stored as a GitHub Actions secret (never in source code)
- Permission scope for reading eligible repositories and creating branches/PRs
- A repository registry/allowlist and opt-out mechanism
- Budget/rate limits, maximum changed files/lines, and failure notifications

The current connected GitHub tools can inspect and edit repositories, but this chat has not been granted approval to create a new controller repository, grant additional GitHub permissions, provision provider credentials, or enable automatic pushes. The workflow remains a blueprint until those approvals and setup steps are completed.

## Safe initial rollout

1. Run the selector in report-only mode for several days.
2. Enable AI-generated PRs for one opted-in repository.
3. Review the generated PRs and validation results.
4. Expand the allowlist only after the workflow behaves reliably.
5. Keep default-branch merges manual.

## Contribution-quality policy

The purpose is maintainable software, not artificial contribution activity. Do not create empty commits, date-only changes, meaningless README edits, or random code. A run that finds no meaningful task should skip cleanly. A green contribution calendar is not guaranteed, and the quality of the portfolio matters more than daily squares.
