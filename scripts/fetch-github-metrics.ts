import * as fs from 'fs';
import * as path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SERVERS_FILE = path.join(__dirname, '../data/servers.json');

interface ServerData {
  id: string;
  name: string;
  description: string;
  githubUrl?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  lastUpdated?: string;
  language?: string;
  license?: string;
  score?: number;
  rating?: number;
  [key: string]: any;
}

interface GitHubRepoData {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  language: string | null;
  license: { spdx_id: string } | null;
}

function extractRepoPath(githubUrl: string): string | null {
  if (!githubUrl) return null;

  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+\/[^\/]+)(?:\/tree|\/blob|\/|$)/,
    /github\.com\/([^\/]+\/[^\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = githubUrl.match(pattern);
    if (match) {
      // Remove any trailing path components like /tree/main/src/...
      return match[1].split('/').slice(0, 2).join('/');
    }
  }

  return null;
}

async function fetchGitHubMetrics(repoPath: string): Promise<GitHubRepoData | null> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'MCP-Directory-Bot'
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repoPath}`, { headers });

    if (response.status === 404) {
      console.log(`  Repo not found: ${repoPath}`);
      return null;
    }

    if (response.status === 403) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      const resetTime = response.headers.get('x-ratelimit-reset');
      console.log(`  Rate limited! Remaining: ${remaining}, Reset: ${resetTime}`);
      return null;
    }

    if (!response.ok) {
      console.log(`  Error ${response.status} for ${repoPath}`);
      return null;
    }

    return await response.json() as GitHubRepoData;
  } catch (error) {
    console.log(`  Fetch error for ${repoPath}:`, error);
    return null;
  }
}

function calculateScore(server: ServerData): number {
  let score = 0;

  // GitHub Stars (15 points max)
  const stars = server.stars || 0;
  if (stars >= 1000) score += 15;
  else if (stars >= 200) score += 8;
  else if (stars >= 50) score += 5;
  else if (stars >= 10) score += 3;
  else if (stars > 0) score += 1;

  // Maintenance/Recency (15 points max)
  if (server.lastUpdated) {
    const lastUpdate = new Date(server.lastUpdated);
    const now = new Date();
    const monthsAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsAgo <= 1) score += 15;
    else if (monthsAgo <= 3) score += 12;
    else if (monthsAgo <= 6) score += 8;
    else if (monthsAgo <= 12) score += 5;
    // Older than 12 months: 0 points
  }

  // Official Status (5 points)
  if (server.isOfficial) score += 5;

  // Documentation (10 points estimated - we assume good docs for official)
  if (server.isOfficial) score += 8;
  else if (server.description && server.description.length > 50) score += 5;
  else score += 3;

  // Baseline community score (20 points estimated)
  score += 10; // Base sentiment score

  // npm downloads would add more (25 points max) - not implemented yet

  return Math.min(score, 100);
}

function scoreToRating(score: number): number {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

async function main() {
  console.log('Reading servers.json...');
  const data = JSON.parse(fs.readFileSync(SERVERS_FILE, 'utf-8'));
  const servers: ServerData[] = data.servers;

  console.log(`Found ${servers.length} servers`);
  console.log(`GitHub Token: ${GITHUB_TOKEN ? 'Present' : 'Missing'}`);

  let updated = 0;
  let errors = 0;

  // Process servers with GitHub URLs
  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];

    // Skip servers without GitHub URLs
    if (!server.githubUrl || !server.githubUrl.includes('github.com')) {
      continue;
    }

    const repoPath = extractRepoPath(server.githubUrl);
    if (!repoPath) {
      console.log(`[${i + 1}/${servers.length}] Could not parse: ${server.githubUrl}`);
      continue;
    }

    console.log(`[${i + 1}/${servers.length}] Fetching ${server.name} (${repoPath})...`);

    const metrics = await fetchGitHubMetrics(repoPath);

    if (metrics) {
      server.stars = metrics.stargazers_count;
      server.forks = metrics.forks_count;
      server.openIssues = metrics.open_issues_count;
      server.lastUpdated = metrics.pushed_at?.split('T')[0];
      server.language = metrics.language || undefined;
      server.license = metrics.license?.spdx_id || undefined;

      // Calculate score and rating
      server.score = calculateScore(server);
      server.rating = scoreToRating(server.score);

      console.log(`  ★ ${server.stars} | Forks: ${server.forks} | Updated: ${server.lastUpdated} | Score: ${server.score} | Rating: ${server.rating}⭐`);
      updated++;
    } else {
      errors++;
    }

    // Small delay to avoid rate limiting (100ms)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Update metadata
  data.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  data.metadata.metricsUpdated = new Date().toISOString();
  data.metadata.serversWithMetrics = updated;

  // Write back
  console.log(`\nWriting updated servers.json...`);
  fs.writeFileSync(SERVERS_FILE, JSON.stringify(data, null, 2));

  console.log(`\nDone!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${servers.length}`);
}

main().catch(console.error);
