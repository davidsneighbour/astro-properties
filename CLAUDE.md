# Assistant instructions for astro-properties

## Commit workflow

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
* Still follow the standing git-safety rules: only commit when the user has
  asked for or clearly authorized it in the current context, never force-push
  or amend published commits, and never use `--no-verify`.

## Project tracking

* GitHub Issues are the source of truth for tasks. `ROADMAP.md` is a
  generated index of open issues; `TODO.md` is a scratchpad for notes not
  yet ready to become issues. Regenerate both with the
  `dnb-project-task-triage` skill after issue changes.
* `ASSUMPTIONS.md` logs project decisions — locked architecture versus
  easily-changed settings. Check it before assuming a technical choice is
  still open.
