const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const app = require('./index');

test('🤖 Cloudflare Agent Readiness & AEO Verification', async (t) => {
  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  await t.test('1. Markdown Content Negotiation on root / returns text/markdown with Vary: Accept', async () => {
    const res = await fetch(`${baseUrl}/`, {
      headers: {
        Accept: 'text/markdown, text/html;q=0.5'
      }
    });

    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /text\/markdown/);
    assert.match(res.headers.get('vary') || '', /Accept/);
    const text = await res.text();
    assert.match(text, /# MyFolio/);
    assert.match(text, /₹149/);
    assert.match(text, /Full Source Code Export/i);
  });

  await t.test('2. Root / with query format=md returns text/markdown', async () => {
    const res = await fetch(`${baseUrl}/?format=md`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /text\/markdown/);
    const text = await res.text();
    assert.match(text, /# MyFolio/);
  });

  await t.test('3. Root / with standard browser Accept returns HTML and Link headers', async () => {
    const res = await fetch(`${baseUrl}/`, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9'
      }
    });

    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /text\/html/);
    const linkHeader = res.headers.get('link') || '';
    assert.match(linkHeader, /rel="describedby"/);
    assert.match(linkHeader, /rel="service-desc"/);
  });

  await t.test('4. Canonical /llms.txt returns 200 and markdown knowledge file', async () => {
    const res = await fetch(`${baseUrl}/llms.txt`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /text\/markdown/);
    const text = await res.text();
    assert.match(text, /MyFolio/);
    assert.match(text, /ZERO VENDOR LOCK-IN/i);
  });

  await t.test('5. RFC 9309 /.well-known/api-catalog returns 200 and linkset', async () => {
    const res = await fetch(`${baseUrl}/.well-known/api-catalog`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /linkset\+json/);
    const body = await res.json();
    assert.ok(Array.isArray(body.linkset));
    assert.equal(body.linkset[0].anchor, 'https://myfolio.tech/api');
  });

  await t.test('6. OpenAPI 3.0 /.well-known/openapi.json returns 200 and valid spec', async () => {
    const res = await fetch(`${baseUrl}/.well-known/openapi.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.openapi, '3.0.3');
    assert.ok(body.paths['/api/templates']);
    assert.ok(body.paths['/api/pricing']);
    assert.ok(body.paths['/api/badge/{username}']);
  });

  await t.test('7. RAG Pointers /.well-known/rag-pointers.json returns 200 and index', async () => {
    const res = await fetch(`${baseUrl}/.well-known/rag-pointers.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.pointers));
    assert.ok(body.pointers.some((p) => p.type === 'llms_summary'));
  });

  await t.test('8. Agent Auth /.well-known/auth.json returns 200 and auth methods', async () => {
    const res = await fetch(`${baseUrl}/.well-known/auth.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.authentication_methods));
  });

  await t.test('9. Agent Manifest /.well-known/agent.json returns 200 and capabilities', async () => {
    const res = await fetch(`${baseUrl}/.well-known/agent.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.name, 'MyFolio AI Portfolio Synthesizer');
    assert.ok(Array.isArray(body.capabilities));
  });

  await t.test('10. WebMCP Manifest /.well-known/mcp.json returns 200 and tool list', async () => {
    const res = await fetch(`${baseUrl}/.well-known/mcp.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.name, 'myfolio-mcp-server');
    assert.ok(Array.isArray(body.tools));
    assert.ok(body.tools.some((t) => t.name === 'generate_portfolio'));
  });

  await t.test('11. Transparent Pricing /api/pricing returns tiers', async () => {
    const res = await fetch(`${baseUrl}/api/pricing`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.tiers));
    assert.equal(body.tiers[0].id, 'free_evaluation');
  });

  await t.test('12. robots.txt unblocks SemrushBot & declares AI discovery endpoints', () => {
    const robotsTxt = fs.readFileSync(path.join(process.cwd(), 'web', 'robots.txt'), 'utf8');
    assert.ok(!robotsTxt.includes('User-agent: SemrushBot\nDisallow: /'));
    assert.ok(robotsTxt.includes('Sitemap: https://myfolio.tech/sitemap.xml'));
    assert.ok(robotsTxt.includes('LLMs: https://myfolio.tech/llms.txt'));
    assert.ok(robotsTxt.includes('OpenAPI: https://myfolio.tech/.well-known/openapi.json'));
    assert.ok(robotsTxt.includes('API-Catalog: https://myfolio.tech/.well-known/api-catalog'));
  });

  await t.test('13. Bot auth guide /auth.md returns 200 and text/markdown with H1 containing auth.md', async () => {
    const res = await fetch(`${baseUrl}/auth.md`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /text\/markdown/);
    const text = await res.text();
    assert.match(text, /# auth\.md/i);
  });

  await t.test('14. A2A Agent Card contains supportedInterfaces, skills, and AP2 extension', async () => {
    const res = await fetch(`${baseUrl}/.well-known/agent-card.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.name, 'MyFolio AI Portfolio Agent');
    assert.ok(Array.isArray(body.supportedInterfaces));
    assert.ok(Array.isArray(body.skills));
    assert.ok(Array.isArray(body.extensions));
    assert.ok(body.extensions.some((ext) => ext.uri.includes('AP2')));
  });

  await t.test('15. Skills Index /.well-known/skills.json returns 200 and skills', async () => {
    const res = await fetch(`${baseUrl}/.well-known/skills.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.skills));
    assert.ok(body.skills.some((s) => s.id === 'generate_portfolio'));
  });

  await t.test('16. OAuth Protected Resource metadata returns 200 and RFC 9728 fields', async () => {
    const res = await fetch(`${baseUrl}/.well-known/oauth-protected-resource`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.resource, 'https://myfolio.tech');
    assert.deepEqual(body.authorization_servers, ['https://myfolio.tech']);
    assert.ok(Array.isArray(body.scopes_supported));
    assert.ok(body.bearer_methods_supported.includes('header'));
  });

  await t.test('17. OAuth Authorization Server metadata contains agent_auth block', async () => {
    const res = await fetch(`${baseUrl}/.well-known/oauth-authorization-server`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.issuer, 'https://myfolio.tech');
    assert.ok(body.agent_auth);
    assert.equal(body.agent_auth.skill, 'https://myfolio.tech/auth.md');
    assert.ok(Array.isArray(body.agent_auth.identity_types_supported));
  });

  await t.test('18. Web Bot Auth JWKS at http-message-signatures-directory returns 200 and keys', async () => {
    const res = await fetch(`${baseUrl}/.well-known/http-message-signatures-directory`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.keys));
    assert.ok(body.keys.length > 0);
  });

  await t.test('19. ACP discovery document /.well-known/acp.json returns 200 and spec', async () => {
    const res = await fetch(`${baseUrl}/.well-known/acp.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.protocol.name, 'acp');
    assert.equal(body.api_base_url, 'https://myfolio.tech/api');
    assert.ok(Array.isArray(body.transports));
    assert.ok(Array.isArray(body.capabilities.services));
  });

  await t.test('20. UCP discovery document /.well-known/ucp returns 200 and services', async () => {
    const res = await fetch(`${baseUrl}/.well-known/ucp`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.protocol_version, '1.0.0');
    assert.ok(Array.isArray(body.services));
    assert.ok(body.endpoints.checkout);
  });

  await t.test('21. OpenAPI document contains MPP x-payment-info and x-service-info', async () => {
    const res = await fetch(`${baseUrl}/openapi.json`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.info['x-service-info']);
    const createOrder = body.paths['/api/web/create-order'];
    assert.ok(createOrder.post['x-payment-info']);
    assert.equal(createOrder.post['x-payment-info'].intent, 'charge');
    assert.equal(createOrder.post['x-payment-info'].amount, 149);
  });

  await t.test('22. WebMCP registration script is present on index.html', () => {
    const indexHtml = fs.readFileSync(path.join(process.cwd(), 'web', 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('navigator.modelContext.registerTool'));
    assert.ok(indexHtml.includes('generate_portfolio'));
  });

  await t.test('23. Protected routes return WWW-Authenticate with resource_metadata on 401', async () => {
    const res = await fetch(`${baseUrl}/api/user/portfolios`, {
      headers: {
        authorization: 'Bearer invalid_token'
      }
    });
    assert.equal(res.status, 401);
    const authHeader = res.headers.get('www-authenticate') || '';
    assert.match(authHeader, /resource_metadata="https:\/\/myfolio\.tech\/\.well-known\/oauth-protected-resource"/);
  });
});
