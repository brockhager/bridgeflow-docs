# IDENTITY

`bf-identity` provides authentication, token issuance, and role-based access primitives.

## Authentication

- Email/password login endpoint returning bearer JWT.
- JWT claims include user, org, role, and permission context.
- Token verification dependency used to guard protected APIs.

## User and Organization Model

- Organization and user persistence.
- Role storage per user with permission expansion.
- Super-admin and org-scoped access behavior.

## Role-Based Permissions

- Role-to-permission mapping for admin, org admin, carrier viewer, and basic user.
- Permission check support for user-management operations.

## User Administration (API)

- Create user flow with role validation and scoped uniqueness checks.
- Delete user endpoint for permissioned admins.
- Seeded starter users for local/dev bootstrap.
