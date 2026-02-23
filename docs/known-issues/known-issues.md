## Fastify ERR_HTTP_HEADERS_SENT Race Conditions

**Status:** Suppressed in test environment

**Impact:** No production impact; headers/CSP work correctly

**Root Cause:** Fastify onSend hooks attempting header writes after response sent

**Mitigation:** Test preload script filters these warnings (see `test/setup-unhandled.js`). The server also uses defensive guards around `onSend` hooks to swallow late errors in the test environment.

**TODO:** Fix individual onSend hooks in a future cleanup phase (see `docs/task-lists/TASK-LIST-3.md` BACKLOG-001)
