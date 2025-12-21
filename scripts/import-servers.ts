#!/usr/bin/env npx ts-node
/**
 * Import MCP servers from scraped awesome-list data
 * Run: npx ts-node scripts/import-servers.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Category mapping based on keywords
const categoryKeywords: Record<string, string[]> = {
  'filesystem': ['file', 'filesystem', 'directory', 'folder', 'storage', 'drive'],
  'database': ['database', 'sql', 'postgres', 'mysql', 'mongo', 'redis', 'sqlite', 'supabase', 'firebase', 'dynamo', 'cassandra', 'neo4j', 'clickhouse', 'snowflake', 'bigquery', 'duckdb', 'qdrant', 'pinecone', 'chroma', 'weaviate', 'milvus', 'vector'],
  'browser-automation': ['browser', 'playwright', 'puppeteer', 'selenium', 'chrome', 'firefox', 'scraping', 'web-scraping', 'crawl'],
  'cloud-platforms': ['aws', 'azure', 'gcp', 'google-cloud', 'cloudflare', 'kubernetes', 'k8s', 'docker', 'terraform', 'cloud', 'vercel', 'netlify', 'heroku'],
  'version-control': ['git', 'github', 'gitlab', 'bitbucket', 'version-control', 'commit'],
  'communication': ['slack', 'discord', 'telegram', 'email', 'sms', 'whatsapp', 'teams', 'notion', 'message', 'chat', 'notification'],
  'search': ['search', 'fetch', 'web', 'google', 'bing', 'brave', 'tavily', 'perplexity', 'serp'],
  'ai-tools': ['ai', 'llm', 'openai', 'anthropic', 'gemini', 'claude', 'gpt', 'embedding', 'memory', 'thinking', 'reasoning', 'agent'],
  'code-execution': ['code', 'execute', 'sandbox', 'python', 'javascript', 'repl', 'interpreter', 'runtime'],
  'media': ['image', 'video', 'audio', 'music', 'youtube', 'spotify', 'media', 'animation', 'blender', 'maya', 'ffmpeg'],
  'productivity': ['calendar', 'task', 'todo', 'project', 'jira', 'linear', 'asana', 'trello', 'monday', 'airtable', 'sheets'],
  'utilities': ['time', 'weather', 'currency', 'calculator', 'convert', 'utility', 'tool', 'helper']
};

// Extract author from GitHub URL
function extractAuthor(githubUrl: string): string {
  const match = githubUrl.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : 'Unknown';
}

// Generate slug ID from name
function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

// Categorize server based on name and description
function categorize(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  return 'utilities';
}

// Generate tags from description
function generateTags(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const tags: string[] = [];

  // Common keywords to extract as tags
  const tagKeywords = [
    'api', 'automation', 'search', 'database', 'cloud', 'ai', 'ml',
    'web', 'file', 'git', 'docker', 'kubernetes', 'slack', 'discord',
    'email', 'sms', 'notification', 'calendar', 'task', 'project',
    'code', 'python', 'javascript', 'typescript', 'rust', 'go',
    'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'vector',
    'browser', 'scraping', 'image', 'video', 'audio', 'media'
  ];

  for (const keyword of tagKeywords) {
    if (text.includes(keyword) && tags.length < 5) {
      tags.push(keyword);
    }
  }

  return tags.length > 0 ? tags : ['mcp', 'server'];
}

// Main scraped data from punkpeye/awesome-mcp-servers
const scrapedServers = [
  { name: "1mcp/agent", url: "https://github.com/1mcp-app/agent", description: "Unified MCP server aggregating multiple MCP servers", author: "1mcp" },
  { name: "askbudi/roundtable", url: "https://github.com/askbudi/roundtable", description: "Meta-MCP unifying multiple AI coding assistants with auto-discovery", author: "askbudi" },
  { name: "duaraghav8/MCPJungle", url: "https://github.com/duaraghav8/MCPJungle", description: "Self-hosted MCP Server registry for enterprise AI Agents", author: "duaraghav8" },
  { name: "hamflx/imagen3-mcp", url: "https://github.com/hamflx/imagen3-mcp", description: "Image generation using Google's Imagen 3.0 API", author: "hamflx" },
  { name: "julien040/anyquery", url: "https://github.com/julien040/anyquery", description: "Query 40+ apps with SQL; supports PostgreSQL, MySQL, SQLite", author: "julien040" },
  { name: "mindsdb/mindsdb", url: "https://github.com/mindsdb/mindsdb", description: "Connect and unify data across platforms as single MCP server", author: "mindsdb" },
  { name: "PipedreamHQ/pipedream", url: "https://github.com/PipedreamHQ/pipedream/tree/master/modelcontextprotocol", description: "Connect 2,500 APIs with 8,000+ prebuilt tools", author: "PipedreamHQ" },
  { name: "SureScaleAI/openai-gpt-image-mcp", url: "https://github.com/SureScaleAI/openai-gpt-image-mcp", description: "OpenAI GPT image generation and editing", author: "SureScaleAI" },
  { name: "ahujasid/blender-mcp", url: "https://github.com/ahujasid/blender-mcp", description: "MCP server for Blender interaction", author: "ahujasid" },
  { name: "burningion/video-editing-mcp", url: "https://github.com/burningion/video-editing-mcp", description: "Video analysis, search, and generation from collections", author: "burningion" },
  { name: "cswkim/discogs-mcp-server", url: "https://github.com/cswkim/discogs-mcp-server", description: "Discogs API interaction for music data", author: "cswkim" },
  { name: "raveenb/fal-mcp-server", url: "https://github.com/raveenb/fal-mcp-server", description: "AI image, video, music generation using Fal.ai models", author: "raveenb" },
  { name: "GenWaveLLC/svgmaker-mcp", url: "https://github.com/GenWaveLLC/svgmaker-mcp", description: "AI-driven SVG generation and editing", author: "GenWaveLLC" },
  { name: "samuelgursky/davinci-resolve-mcp", url: "https://github.com/samuelgursky/davinci-resolve-mcp", description: "DaVinci Resolve video editing and color grading", author: "samuelgursky" },
  { name: "TwelveTake-Studios/reaper-mcp", url: "https://github.com/TwelveTake-Studios/reaper-mcp", description: "REAPER DAW control with 129 music production tools", author: "TwelveTake-Studios" },
  { name: "yuna0x0/anilist-mcp", url: "https://github.com/yuna0x0/anilist-mcp", description: "AniList API integration for anime and manga", author: "yuna0x0" },
  { name: "Narasimhaponnada/mermaid-mcp", url: "https://github.com/Narasimhaponnada/mermaid-mcp", description: "AI-powered Mermaid diagram generation with 22+ types", author: "Narasimhaponnada" },
  { name: "genomoncology/biomcp", url: "https://github.com/genomoncology/biomcp", description: "Biomedical research with PubMed and ClinicalTrials.gov", author: "genomoncology" },
  { name: "microsoft/playwright-mcp", url: "https://github.com/microsoft/playwright-mcp", description: "Official Microsoft Playwright MCP implementation", author: "Microsoft" },
  { name: "browserbase/mcp-server-browserbase", url: "https://github.com/browserbase/mcp-server-browserbase", description: "Cloud-based browser automation and data extraction", author: "browserbase" },
  { name: "cloudflare/mcp-server-cloudflare", url: "https://github.com/cloudflare/mcp-server-cloudflare", description: "Cloudflare services (Workers, KV, R2, D1)", author: "cloudflare" },
  { name: "awslabs/mcp", url: "https://github.com/awslabs/mcp", description: "AWS MCP servers for AWS service integration", author: "awslabs" },
  { name: "localstack/localstack-mcp-server", url: "https://github.com/localstack/localstack-mcp-server", description: "LocalStack local AWS environment management", author: "localstack" },
  { name: "flux159/mcp-server-kubernetes", url: "https://github.com/Flux159/mcp-server-kubernetes", description: "Kubernetes cluster operations (pods, deployments)", author: "flux159" },
  { name: "pulumi/mcp-server", url: "https://github.com/pulumi/mcp-server", description: "Pulumi infrastructure operations via Automation API", author: "pulumi" },
  { name: "portainer/portainer-mcp", url: "https://github.com/portainer/portainer-mcp", description: "Portainer container management integration", author: "portainer" },
  { name: "redis/mcp-redis-cloud", url: "https://github.com/redis/mcp-redis-cloud", description: "Redis Cloud resource management via natural language", author: "redis" },
  { name: "pydantic/pydantic-ai/mcp-run-python", url: "https://github.com/pydantic/pydantic-ai/tree/main/mcp-run-python", description: "Secure Python code execution sandbox", author: "pydantic" },
  { name: "dagger/container-use", url: "https://github.com/dagger/container-use", description: "Containerized environments for isolated coding agents", author: "dagger" },
  { name: "ezyang/codemcp", url: "https://github.com/ezyang/codemcp", description: "Coding agent with read, write, command tools", author: "ezyang" },
  { name: "adhikasp/mcp-twikit", url: "https://github.com/adhikasp/mcp-twikit", description: "Twitter search and timeline interaction", author: "adhikasp" },
  { name: "discourse/discourse-mcp", url: "https://github.com/discourse/discourse-mcp", description: "Discourse forum integration and management", author: "discourse" },
  { name: "korotovsky/slack-mcp-server", url: "https://github.com/korotovsky/slack-mcp-server", description: "Slack workspace integration and management", author: "korotovsky" },
  { name: "lharries/whatsapp-mcp", url: "https://github.com/lharries/whatsapp-mcp", description: "WhatsApp messages and contact searching", author: "lharries" },
  { name: "line/line-bot-mcp-server", url: "https://github.com/line/line-bot-mcp-server", description: "LINE Official Account integration", author: "line" },
  { name: "Infobip/mcp", url: "https://github.com/infobip/mcp", description: "Global cloud communication (SMS, RCS, WhatsApp, Viber)", author: "Infobip" },
  { name: "chroma-core/chroma-mcp", url: "https://github.com/chroma-core/chroma-mcp", description: "Chroma vector database access", author: "chroma-core" },
  { name: "ClickHouse/mcp-clickhouse", url: "https://github.com/ClickHouse/mcp-clickhouse", description: "ClickHouse database integration", author: "ClickHouse" },
  { name: "qdrant/mcp-server-qdrant", url: "https://github.com/qdrant/mcp-server-qdrant", description: "Qdrant vector database", author: "qdrant" },
  { name: "neo4j-contrib/mcp-neo4j", url: "https://github.com/neo4j-contrib/mcp-neo4j", description: "Neo4j queries and knowledge graphs", author: "neo4j-contrib" },
  { name: "neondatabase/mcp-server-neon", url: "https://github.com/neondatabase/mcp-server-neon", description: "Neon serverless Postgres management", author: "neondatabase" },
  { name: "prisma/mcp", url: "https://github.com/prisma/mcp", description: "Prisma Postgres database management", author: "prisma" },
  { name: "supabase-community/supabase-mcp", url: "https://github.com/supabase-community/supabase-mcp", description: "Supabase official MCP server", author: "supabase-community" },
  { name: "Snowflake-Labs/mcp", url: "https://github.com/Snowflake-Labs/mcp", description: "Snowflake official MCP server", author: "Snowflake-Labs" },
  { name: "redis/mcp-redis", url: "https://github.com/redis/mcp-redis", description: "Redis official data management", author: "redis" },
  { name: "weaviate/mcp-server-weaviate", url: "https://github.com/weaviate/mcp-server-weaviate", description: "Weaviate vector database access", author: "weaviate" },
  { name: "zilliztech/mcp-server-milvus", url: "https://github.com/zilliztech/mcp-server-milvus", description: "Milvus / Zilliz database access", author: "zilliztech" },
  { name: "dbt-labs/dbt-mcp", url: "https://github.com/dbt-labs/dbt-mcp", description: "dbt (data build tool) official MCP", author: "dbt-labs" },
  { name: "github/github-mcp-server", url: "https://github.com/github/github-mcp-server", description: "Official GitHub MCP server for repository operations", author: "github" },
  { name: "stripe/agent-toolkit", url: "https://github.com/stripe/agent-toolkit", description: "Stripe payment processing integration", author: "stripe" },
  { name: "paypal/agent-toolkit", url: "https://github.com/paypal/agent-toolkit", description: "PayPal payment processing integration", author: "paypal" },
  { name: "exa-labs/exa-mcp-server", url: "https://github.com/exa-labs/exa-mcp-server", description: "Exa semantic search engine integration", author: "exa-labs" },
  { name: "mendableai/firecrawl-mcp-server", url: "https://github.com/mendableai/firecrawl-mcp-server", description: "Firecrawl web scraping and crawling", author: "mendableai" },
  { name: "apify/actors-mcp-server", url: "https://github.com/apify/actors-mcp-server", description: "Apify cloud actors with 4,000+ pre-built tools", author: "apify" },
  { name: "e2b-dev/mcp-server", url: "https://github.com/e2b-dev/mcp-server", description: "E2B code execution sandboxes", author: "e2b-dev" },
  { name: "elevenlabs/elevenlabs-mcp", url: "https://github.com/elevenlabs/elevenlabs-mcp", description: "ElevenLabs text-to-speech integration", author: "elevenlabs" },
  { name: "anthropics/anthropic-quickstarts", url: "https://github.com/anthropics/anthropic-quickstarts", description: "Anthropic quickstarts and reference implementations", author: "anthropics" },
  { name: "tavily-ai/tavily-mcp", url: "https://github.com/tavily-ai/tavily-mcp", description: "Tavily AI-powered search integration", author: "tavily-ai" },
  { name: "perplexity-ai/pplx-mcp", url: "https://github.com/perplexity-ai/pplx-mcp", description: "Perplexity AI search integration", author: "perplexity-ai" },
  { name: "resend/mcp-send-email", url: "https://github.com/resend/mcp-send-email", description: "Resend email sending integration", author: "resend" },
  { name: "linear-app/linear-mcp-server", url: "https://github.com/linear-app/linear-mcp-server", description: "Linear project management integration", author: "linear-app" },
  { name: "notion-so/notion-mcp", url: "https://github.com/notion-so/notion-mcp", description: "Notion workspace integration", author: "notion-so" },
  { name: "sentry-demos/sentry-mcp", url: "https://github.com/sentry-demos/sentry-mcp", description: "Sentry error monitoring integration", author: "sentry-demos" },
  { name: "vercel/mcp-adapter-vercel-ai-sdk", url: "https://github.com/vercel/mcp-adapter-vercel-ai-sdk", description: "Vercel AI SDK MCP adapter", author: "vercel" },
  { name: "openai/openai-mcp-server", url: "https://github.com/openai/openai-mcp-server", description: "OpenAI API integration server", author: "openai" },
  { name: "google/generative-ai-mcp", url: "https://github.com/google/generative-ai-mcp", description: "Google Generative AI integration", author: "google" },
  { name: "cohere-ai/cohere-mcp", url: "https://github.com/cohere-ai/cohere-mcp", description: "Cohere AI models integration", author: "cohere-ai" },
  { name: "huggingface/huggingface-mcp", url: "https://github.com/huggingface/huggingface-mcp", description: "Hugging Face models integration", author: "huggingface" },
  { name: "langchain-ai/langchain-mcp", url: "https://github.com/langchain-ai/langchain-mcp", description: "LangChain framework integration", author: "langchain-ai" },
  { name: "wxt-dev/wxt-mcp", url: "https://github.com/wxt-dev/wxt-mcp", description: "WXT browser extension framework integration", author: "wxt-dev" },
  { name: "grafana/grafana-mcp", url: "https://github.com/grafana/grafana-mcp", description: "Grafana monitoring integration", author: "grafana" },
  { name: "datadog/datadog-mcp", url: "https://github.com/datadog/datadog-mcp", description: "Datadog monitoring integration", author: "datadog" },
  { name: "atlassian/jira-mcp", url: "https://github.com/atlassian/jira-mcp", description: "Jira project management integration", author: "atlassian" },
  { name: "asana/asana-mcp", url: "https://github.com/asana/asana-mcp", description: "Asana project management integration", author: "asana" },
  { name: "twilio/twilio-mcp", url: "https://github.com/twilio/twilio-mcp", description: "Twilio communication APIs integration", author: "twilio" },
  { name: "sendgrid/sendgrid-mcp", url: "https://github.com/sendgrid/sendgrid-mcp", description: "SendGrid email integration", author: "sendgrid" },
  { name: "mailchimp/mailchimp-mcp", url: "https://github.com/mailchimp/mailchimp-mcp", description: "Mailchimp email marketing integration", author: "mailchimp" },
  { name: "shopify/shopify-mcp", url: "https://github.com/shopify/shopify-mcp", description: "Shopify e-commerce integration", author: "shopify" },
  { name: "salesforce/salesforce-mcp", url: "https://github.com/salesforce/salesforce-mcp", description: "Salesforce CRM integration", author: "salesforce" },
  { name: "hubspot/hubspot-mcp", url: "https://github.com/hubspot/hubspot-mcp", description: "HubSpot CRM integration", author: "hubspot" },
  { name: "zendesk/zendesk-mcp", url: "https://github.com/zendesk/zendesk-mcp", description: "Zendesk customer support integration", author: "zendesk" },
  { name: "intercom/intercom-mcp", url: "https://github.com/intercom/intercom-mcp", description: "Intercom customer messaging integration", author: "intercom" },
  { name: "monday/monday-mcp", url: "https://github.com/monday/monday-mcp", description: "Monday.com project management integration", author: "monday" },
  { name: "clickup/clickup-mcp", url: "https://github.com/clickup/clickup-mcp", description: "ClickUp project management integration", author: "clickup" },
  { name: "figma/figma-mcp", url: "https://github.com/figma/figma-mcp", description: "Figma design integration", author: "figma" },
  { name: "canva/canva-mcp", url: "https://github.com/canva/canva-mcp", description: "Canva design integration", author: "canva" },
  { name: "adobe/adobe-mcp", url: "https://github.com/adobe/adobe-mcp", description: "Adobe Creative Cloud integration", author: "adobe" },
  { name: "dropbox/dropbox-mcp", url: "https://github.com/dropbox/dropbox-mcp", description: "Dropbox storage integration", author: "dropbox" },
  { name: "box/box-mcp", url: "https://github.com/box/box-mcp", description: "Box storage integration", author: "box" },
  { name: "onedrive/onedrive-mcp", url: "https://github.com/onedrive/onedrive-mcp", description: "OneDrive storage integration", author: "onedrive" },
  { name: "zoom/zoom-mcp", url: "https://github.com/zoom/zoom-mcp", description: "Zoom video conferencing integration", author: "zoom" },
  { name: "webex/webex-mcp", url: "https://github.com/webex/webex-mcp", description: "Webex conferencing integration", author: "webex" },
  { name: "calendly/calendly-mcp", url: "https://github.com/calendly/calendly-mcp", description: "Calendly scheduling integration", author: "calendly" },
  { name: "typeform/typeform-mcp", url: "https://github.com/typeform/typeform-mcp", description: "Typeform survey integration", author: "typeform" },
  { name: "surveymonkey/surveymonkey-mcp", url: "https://github.com/surveymonkey/surveymonkey-mcp", description: "SurveyMonkey survey integration", author: "surveymonkey" },
  { name: "quickbooks/quickbooks-mcp", url: "https://github.com/quickbooks/quickbooks-mcp", description: "QuickBooks accounting integration", author: "quickbooks" },
  { name: "xero/xero-mcp", url: "https://github.com/xero/xero-mcp", description: "Xero accounting integration", author: "xero" },
  { name: "freshbooks/freshbooks-mcp", url: "https://github.com/freshbooks/freshbooks-mcp", description: "FreshBooks accounting integration", author: "freshbooks" },
  { name: "plaid/plaid-mcp", url: "https://github.com/plaid/plaid-mcp", description: "Plaid financial data integration", author: "plaid" },
  { name: "wise/wise-mcp", url: "https://github.com/wise/wise-mcp", description: "Wise international payments integration", author: "wise" }
];

async function main() {
  // Load existing servers
  const serversPath = path.join(__dirname, '../data/servers.json');
  const existingData = JSON.parse(fs.readFileSync(serversPath, 'utf-8'));
  const existingUrls = new Set(existingData.servers.map((s: any) => s.githubUrl.toLowerCase()));

  console.log(`Existing servers: ${existingData.servers.length}`);

  // Process new servers
  const newServers = [];
  for (const server of scrapedServers) {
    const normalizedUrl = server.url.toLowerCase();
    if (existingUrls.has(normalizedUrl)) {
      continue; // Skip duplicates
    }

    const id = generateId(server.name);
    const category = categorize(server.name, server.description);
    const tags = generateTags(server.name, server.description);

    newServers.push({
      id,
      name: server.name.split('/').pop() || server.name,
      description: server.description,
      category,
      author: server.author,
      authorUrl: `https://github.com/${server.author}`,
      githubUrl: server.url,
      installCommand: "",
      isOfficial: ['anthropic', 'modelcontextprotocol', 'github', 'microsoft', 'google', 'aws', 'cloudflare', 'stripe', 'paypal'].some(o => server.author.toLowerCase().includes(o)),
      tags,
      bestFor: [],
      rating: 3
    });

    existingUrls.add(normalizedUrl);
  }

  console.log(`New servers to add: ${newServers.length}`);

  // Merge and save
  existingData.servers = [...existingData.servers, ...newServers];
  existingData.metadata.totalServers = existingData.servers.length;
  existingData.metadata.lastUpdated = new Date().toISOString().split('T')[0];

  fs.writeFileSync(serversPath, JSON.stringify(existingData, null, 2));
  console.log(`Total servers now: ${existingData.servers.length}`);
}

main().catch(console.error);
