# Authentication MVP Spec (Thin Slice)

**Owner:** Customer Core | Agent4
**Date:** 2025-12-23

## Goal
Ship a minimal, secure authentication system to support user registration, login, session management, and a basic "My workspace" endpoint for the next phase of work.

## Scope (6-point MVP)
1. **User registration** (POST /api/auth/register)
   - Accepts: email, password, name
   - Validations: email format, password >= 8 chars
   - Store: hashed password (bcrypt)
   - Response: 201 with token + user metadata
   - Acceptance: user record created and JWT returned; cookie set when supported

2. **Login** (POST /api/auth/login)
   - Accepts: email, password
   - Response: JWT token + user info; sets httpOnly cookie
   - Rate limit: protect via `authRateLimitConfig` (existing)
   - **Super-admin support**: JWT includes `isSuperAdmin` flag for users in `SUPER_ADMINS` environment variable

3. **Logout** (POST /api/auth/logout)
   - Clears auth cookie and returns success

4. **Session & middleware**
   - `authMiddleware` (requires token) and `optionalAuthMiddleware` (attach user if present)
   - Tokens: JWT signed using existing Fastify JWT plugin
   - Cookie-based session: token in httpOnly cookie (set on register/login)

5. **My workspace** (GET /api/auth/me)
   - Returns currently authenticated user info
   - Requires `authMiddleware`

6. **Security & tests**
   - Passwords hashed with bcrypt (SALT_ROUNDS configured)
   - Basic tests: registration success, registration missing fields, login success/fail
   - Add integration test that exercises full registration -> login flow

## Non-goals for MVP
- Email verification
- Multi-factor auth
- OAuth/OIDC
- Account recovery pages

## Acceptance criteria
- All auth-related unit and integration tests pass locally (USE_MOCK_DB=true)
- Registration endpoint returns 201 and creates a user record
- Login endpoint returns 200 with token for valid credentials and 401 for invalid
- Auth middleware protects `/api/auth/me` and returns 401 when no token

## Next steps after MVP
- Add password reset flow, email verification, account recovery
- Add account management pages and admin user management UI
- Add session revocation and refresh tokens (if needed)

