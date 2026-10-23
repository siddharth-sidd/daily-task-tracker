# AI-Assisted GitHub Project Automation Playbook

This guide describes a free/low-cost workflow for building credible portfolio projects with AI while keeping code review, tests, and publishing under your control.

## Recommended workflow

1. Pick one user problem and define a small vertical slice.
2. Use an AI coding tool to inspect the existing repository before editing it.
3. Ask for a plan and acceptance criteria before asking it to write code.
4. Work on a feature branch; never overwrite the main branch blindly.
5. Run install, lint/type-check, unit tests, and production build locally or in GitHub Actions.
6. Inspect the diff and test behavior manually.
7. Open a pull request and merge only after checks pass.
8. Keep a changelog and update README screenshots/setup steps only when verified.

## Free-tier tools to investigate

- Google AI Studio / Gemini API: free tier for supported models, subject to model-specific rate limits. Keep the API key in local environment variables or GitHub Actions secrets; never commit it.
- GitHub Copilot Free: useful for in-editor coding assistance within its published usage limits.
- GitHub Actions: scheduled/manual checks and CI. Standard hosted runners for public repositories are free; private repository allowances and storage are plan-dependent.
- VS Code: editor and integrated terminal.
- GitHub Issues and Pull Requests: task breakdown, review, and traceability.

Always check the vendors' current free limits and terms before relying on a quota.

## Reusable AI engineering prompt

You are a senior software engineer contributing to an existing portfolio repository.

First inspect the repository structure, README, package scripts, data model, and tests. Do not assume the stack; report what you find. Propose one small, production-minded feature that fits the existing codebase and solves a real user problem. Avoid duplicating existing features or creating a new repository unless explicitly requested.

Before coding, provide:
- problem and target user
- assumptions and acceptance criteria
- files likely to change
- data/security implications
- test plan and rollback plan

Then implement the smallest complete vertical slice. Follow the existing patterns and style. Add input validation, useful error messages, safe logging, and tests where appropriate. Do not hardcode credentials, use fake production data, or claim tests passed unless you actually ran them. Do not remove existing behavior to make tests pass.

Run the repository's available checks (install, lint/type-check, unit tests, production build). If a check cannot run, state exactly why. Review the final diff for secrets, accidental data deletion, and unrelated changes. Summarize changed files, how to run it, known limitations, and manual QA steps. Do not merge or deploy without explicit approval.

## Portfolio project standards

Every substantial project should include:
- a clear problem statement and real use case
- setup instructions and environment variable examples
- architecture diagram or concise architecture section
- input validation and error handling
- meaningful automated tests
- CI workflow
- accessibility and responsive behavior if there is a UI
- security notes and threat assumptions
- useful screenshots/demo link only if genuine
- documented limitations and roadmap
- sensible commit history and understandable code

## Suggested backlog for Daily Task Tracker

Prioritize one item at a time and verify whether it already exists:
1. Replace file-backed persistence with MongoDB/PostgreSQL using migrations and repository abstraction, after backups and data model review.
2. Add API integration tests for authentication, authorization, and task ownership.
3. Add email verification and password reset with expiring, single-use tokens.
4. Add recurring tasks and timezone-aware reminders.
5. Add a privacy-conscious audit trail for admin operations.
6. Add deployment health checks and structured logs without exposing secrets.
7. Add dependency/security scanning and a documented release checklist.

Do not implement authentication, email, database migration, or admin changes in a large unreviewed batch. These need threat modeling, tests, and staged rollout.

## Weekly review checklist

- [ ] Read CI results and resolve failures.
- [ ] Choose one issue with measurable acceptance criteria.
- [ ] Ask AI for a plan before changes.
- [ ] Implement on a feature branch.
- [ ] Run tests and inspect the diff.
- [ ] Update documentation to match verified behavior.
- [ ] Open a PR and merge after passing checks.
- [ ] Keep the project demo, screenshots, and resume description truthful.

## Security

Never paste API keys, OAuth tokens, passwords, private contact lists, production database dumps, or real customer data into prompts or public repos. Use GitHub Actions secrets for automation credentials. Grant the least permissions needed. Require human review before publishing generated code or sending email.
