'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';

const categories = [
  'filesystem',
  'database',
  'browser-automation',
  'cloud-platforms',
  'version-control',
  'communication',
  'search',
  'ai-tools',
  'code-execution',
  'media',
  'productivity',
  'utilities',
];

const categoryLabels: Record<string, string> = {
  'filesystem': 'Filesystem',
  'database': 'Database',
  'browser-automation': 'Browser Automation',
  'cloud-platforms': 'Cloud Platforms',
  'version-control': 'Version Control',
  'communication': 'Communication',
  'search': 'Search',
  'ai-tools': 'AI Tools',
  'code-execution': 'Code Execution',
  'media': 'Media',
  'productivity': 'Productivity',
  'utilities': 'Utilities',
};

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    githubUrl: '',
    name: '',
    description: '',
    category: 'utilities',
    installCommand: '',
    bestFor: '',
    isOfficial: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate GitHub issue body
    const issueBody = `## New MCP Server Submission

**GitHub Repository:** ${formData.githubUrl}
**Name:** ${formData.name}
**Description:** ${formData.description}
**Category:** ${categoryLabels[formData.category]}
**Install Command:** \`${formData.installCommand}\`
**Best For:** ${formData.bestFor}
**Official:** ${formData.isOfficial ? 'Yes' : 'No (Community)'}

---
*Submitted via MCPList.site*`;

    const issueTitle = `[New Server] ${formData.name}`;
    const issueUrl = `https://github.com/tomsmithtld/mcplist/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=new-server`;

    window.open(issueUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-surface-0">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Submit an MCP Server
          </h1>
          <p className="text-text-secondary">
            Help grow the directory by submitting your favorite MCP servers.
            Your submission will create a GitHub issue for review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GitHub URL */}
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-text-primary mb-2">
              GitHub Repository URL <span className="text-accent">*</span>
            </label>
            <input
              type="url"
              id="githubUrl"
              required
              placeholder="https://github.com/username/mcp-server-name"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface-1 border border-surface-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Server Name <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              placeholder="e.g., Filesystem MCP"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface-1 border border-surface-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
              Description <span className="text-accent">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={3}
              placeholder="A brief description of what the server does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface-1 border border-surface-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-2">
              Category <span className="text-accent">*</span>
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface-1 border border-surface-4 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Install Command */}
          <div>
            <label htmlFor="installCommand" className="block text-sm font-medium text-text-primary mb-2">
              Install Command <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              id="installCommand"
              required
              placeholder="e.g., npx @anthropic/mcp-server-filesystem"
              value={formData.installCommand}
              onChange={(e) => setFormData({ ...formData, installCommand: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface-1 border border-surface-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-mono text-sm"
            />
          </div>

          {/* Best For */}
          <div>
            <label htmlFor="bestFor" className="block text-sm font-medium text-text-primary mb-2">
              Best For (comma-separated use cases)
            </label>
            <input
              type="text"
              id="bestFor"
              placeholder="e.g., reading files, writing code, local development"
              value={formData.bestFor}
              onChange={(e) => setFormData({ ...formData, bestFor: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface-1 border border-surface-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {/* Is Official */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isOfficial"
              checked={formData.isOfficial}
              onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
              className="w-5 h-5 rounded bg-surface-1 border border-surface-4 text-accent focus:ring-accent focus:ring-offset-0"
            />
            <label htmlFor="isOfficial" className="text-sm text-text-secondary">
              This is an official Anthropic/MCP server
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 bg-accent hover:bg-accent-dim text-surface-0 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Create GitHub Issue to Submit
          </button>

          <p className="text-sm text-text-muted text-center">
            Submissions are reviewed manually. Approved servers will be added within 24-48 hours.
          </p>
        </form>
      </main>
    </div>
  );
}
