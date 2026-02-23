# Service: bf-fintech

## Purpose

Freight billing and payment workflows (invoices, Stripe checkout, webhook payment confirmation).

## API Endpoint

- Base deployment endpoint not yet documented.
- Core endpoints:
  - `GET /health`
  - `GET /invoices`
  - `GET /invoices/{invoice_id}`
  - `POST /invoices/{invoice_id}/pay`
  - `POST /webhooks/stripe`

## Status

Development.

## Repository

- `https://github.com/brockhager/bf-fintech`
