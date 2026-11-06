# MyFolio Bot & AI Agent Authentication Guide (auth.md)
> Machine-readable and human-readable authentication instructions for automated agents, web crawlers, and developers interacting with MyFolio (https://myfolio.tech).

---

## 1. Zero-Authentication Public Endpoints (Free Tier & Discovery)

The following endpoints require **NO authentication, NO API keys, and NO payment/credit card**:

- **Web Studio Evaluation**: `https://myfolio.tech/studio`
  - Ingests public GitHub profiles and generates up to 3 interactive 3D WebGL builds per week.
- **Visual Universes & Templates**: `GET https://myfolio.tech/api/templates`
- **Pricing & Build Model**: `GET https://myfolio.tech/api/pricing`
- **GitHub Profile README Badge**: `GET https://myfolio.tech/api/badge/:username`
- **LLM Knowledge Base**: `GET https://myfolio.tech/llms.txt`
- **Agent Discovery & Tool Catalogs**:
  - `GET https://myfolio.tech/.well-known/agent-card.json`
  - `GET https://myfolio.tech/.well-known/mcp.json`
  - `GET https://myfolio.tech/.well-known/api-catalog`
  - `GET https://myfolio.tech/.well-known/openapi.json`
  - `GET https://myfolio.tech/.well-known/skills.json`

Rate limits on public endpoints: 60 requests/minute burst, 2 requests/second sustained.

---

## 2. Authenticated Endpoints (User Sessions & Source Code Export)

Operations involving saving builds permanently, claiming branded vanity subdomains (`<username>.myfolio.tech`), or downloading standalone source code ZIP bundles require authentication.

### Authentication Methods Supported:

1. **Session Cookie / JWT Bearer Token**:
   - **Login Page**: `https://myfolio.tech/login`
   - **Login Endpoint**: `POST https://myfolio.tech/api/auth/login`
     - Payload: `{"email": "user@example.com", "password": "..."}`
     - Response: Sets HTTP-only secure session cookie and returns `{ "token": "jwt...", "user": { ... } }`.
   - **Magic Link**: `POST https://myfolio.tech/api/auth/magic-link`
   - **Signup**: `https://myfolio.tech/signup`

2. **Authorization Header**:
   - Pass the bearer token in requests to protected API endpoints:
     ```http
     Authorization: Bearer <jwt_token>
     ```

---

## 3. Machine-to-Machine & Automated Agent Guidelines

- **User-Agent**: Please identify your agent (e.g. `User-Agent: MyAgent/1.0 (+https://example.com/bot)`).
- **Format Negotiation**: When requesting page content, include header `Accept: text/markdown` to receive concise, token-efficient Markdown instead of heavy WebGL HTML.
- **Contact & Support**: aziz@myfolio.tech | support@myfolio.tech
