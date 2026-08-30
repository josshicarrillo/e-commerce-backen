#!/usr/bin/env bash
set -euo pipefail

curl -sS -X POST http://localhost:8080/api/sessions/register \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "Ana@Mail.com",
    "password": "Secreta123"
  }'
