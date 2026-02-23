# CI Setup Notes

This document captures small gotchas and patterns for GitHub Actions in this repo.

## pnpm cache pitfall
- Avoid using `cache: 'pnpm'` on `actions/setup-node` for workflows that don't have pnpm installed already.
- Using `cache: 'pnpm'` can cause the runner to attempt pnpm operations before `pnpm` is actually installed, which leads to errors like "Unable to locate executable file: pnpm".
- Preferred pattern:
  - After `actions/setup-node`, explicitly setup pnpm with `pnpm/action-setup@v4`:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'

- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 8.15.0
    run_install: false

- name: Verify pnpm
  run: |
    command -v pnpm || (echo "pnpm not found" && exit 1)
    pnpm -v
```

- This avoids implicit pnpm usage and provides a clear verify step that fails fast with useful diagnostics.
