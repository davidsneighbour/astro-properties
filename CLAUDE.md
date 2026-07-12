# Assistant instructions for astro-properties

## Commit workflow

* **Standing authorization, no per-commit confirmation needed:** until this
  project reaches its initial-product milestone, work directly on `main` —
  no feature branches, no pull requests. Commit *and push straight to
  `origin/main`* after finishing each discrete step, without pausing to ask
  first. This is a deliberate, explicit override of the general
  confirm-before-push default, scoped to this repo for this pre-product
  phase. Once an initial product is reached, ask the user before reverting
  to this default vs. adopting a branch/PR workflow — don't assume either
  way.
* Commit after finishing each discrete step of work — don't let multiple
  unrelated steps pile up uncommitted. A "step" is roughly the same unit of
  work as one GitHub issue, or one clearly separable change if not tied to
  an issue.
* Every commit message must explain *what changed and why*, not just what
  files moved — write real notes, not a one-line label.
* Every commit must reference at least one GitHub issue (e.g. `#12`,
  `Refs #12`, or `Closes #12` when the commit fully resolves it) in the
  commit body. If no issue exists yet for the work, create one first (see
  `ROADMAP.md`/`TODO.md` for the current tracking state), then commit.
* The push-without-asking authorization above covers ordinary fast-forward
  pushes to `main` only. Still follow every other standing git-safety rule
  without exception: never force-push, never amend or rewrite published
  commits, and never use `--no-verify`. If a push would need to be
  non-fast-forward for any reason, stop and ask instead of forcing it.

## Project tracking

* GitHub Issues are the source of truth for tasks. `ROADMAP.md` is a
  generated index of open issues; `TODO.md` is a scratchpad for notes not
  yet ready to become issues. Regenerate both with the
  `dnb-project-task-triage` skill after issue changes.
* `ASSUMPTIONS.md` logs project decisions — locked architecture versus
  easily-changed settings. Check it before assuming a technical choice is
  still open.
