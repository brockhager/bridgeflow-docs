# GitHub Actions: Safe Secrets Handling

This short note explains a common gotcha when writing workflow conditionals and how we handle it in this repo.

Problem
-------
- Using `secrets` directly in a workflow `if:` expression (e.g. `if: secrets.API_TOKEN`) can fail with:
  `Unrecognized named-value: 'secrets'` during workflow validation.
- The parser/evaluation context for `if:` expressions is limited and may not include `secrets` in some cases.

Pattern we use
---------------
- Avoid referencing `secrets` in `if:` expressions.
- Instead, gate the step on a non-secret variable (e.g., `vars.STAGING_APP_URL`) and then check the presence of the secret inside the step script:

```yaml
if: ${{ vars.STAGING_APP_URL && vars.STAGING_APP_URL != 'http://localhost:3000' }}
run: |
  if [ -z "${{ secrets.API_TOKEN }}" ]; then
    echo "No API_TOKEN secret provided - skipping API health check"
    exit 0
  fi
  curl -f -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" "${APP_URL}/api/health"
```

Why this is better
------------------
- Avoids workflow syntax errors caused by unavailable named-values in `if:` contexts.
- Keeps secret use confined to step runtime where secrets are available and hidden from logs unless explicitly echoed.

Security notes
--------------
- Never echo raw secrets into logs.
- Use `curl -sS` or similar to avoid accidental output; if in debug mode, redact secrets before printing.
- Consider using environment-specific role-based secrets in GitHub Environments for added control.
