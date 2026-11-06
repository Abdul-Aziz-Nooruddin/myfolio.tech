# auth.md — MyFolio Agent Authentication & Registration

> Canonical discovery and authentication instructions for autonomous AI agents, web bots, and developers interacting with MyFolio (https://myfolio.tech).

---

## 1. Agent Audience & Overview
MyFolio provides autonomous 3D WebGL developer portfolio synthesis. Automated AI agents can:
1. Ingest public developer credentials and evaluate 3D visual universes (`/studio`).
2. Query active templates and styling metadata (`/api/templates`).
3. Generate and verify GitHub Profile README badges (`/api/badge/:username`).
4. Programmatically request portfolio generation and source code exports.

---

## 2. Zero-Authentication Anonymous Discovery (Free Evaluation)
Agents and evaluators can interact with the following endpoints without credentials:
- **Interactive Studio**: `https://myfolio.tech/studio` (allows 3 free builds/week)
- **Visual Universes**: `GET https://myfolio.tech/api/templates`
- **Pricing & Build Model**: `GET https://myfolio.tech/api/pricing`
- **Profile Badges**: `GET https://myfolio.tech/api/badge/:username`
- **Knowledge Base**: `GET https://myfolio.tech/llms.txt`

---

## 3. Agent Registration & Provisioning
When agents need to perform authenticated actions (saving portfolios, claiming subdomains, downloading standalone ZIP packages):
- **Agent Registration URI**: `POST https://myfolio.tech/api/auth/register`
- **Token Endpoint**: `POST https://myfolio.tech/api/auth/login`
- **Identity Types Supported**:
  - `anonymous`: Ephemeral tokens generated on `/studio` session start.
  - `identity_assertion`: Verified email assertions via magic link (`/api/auth/magic-link`) or OAuth Bearer JWT.

---

## 4. Protected Resource Metadata
- **Resource Server**: `https://myfolio.tech/api`
- **Authorization Server**: `https://myfolio.tech`
- **OAuth Protected Resource Document**: `https://myfolio.tech/.well-known/oauth-protected-resource`
- **OAuth Server Metadata**: `https://myfolio.tech/.well-known/oauth-authorization-server`
- **Bearer Method**: Authorization Header (`Authorization: Bearer <token>`)
