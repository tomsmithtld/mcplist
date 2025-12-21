'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import serversData from '@/data/servers.json';
import { Header } from '@/components/Header';
import { VoteButtons } from '@/components/VoteButtons';
import { ReviewList } from '@/components/ReviewList';

interface Server {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  authorUrl: string;
  githubUrl: string;
  npmPackage?: string;
  installCommand: string;
  isOfficial: boolean;
  tags: string[];
  bestFor: string[];
  rating: number;
  stars?: number;
  forks?: number;
  openIssues?: number;
  lastUpdated?: string;
  language?: string;
  license?: string;
  score?: number;
}

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

export default function ServerPage() {
  const params = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const serverId = params.id as string;
  const server = (serversData.servers as Server[]).find((s) => s.id === serverId);

  if (!server) {
    return (
      <div className="min-h-screen bg-surface-0">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Server not found</h1>
          <p className="text-text-muted mb-8">The server you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const copyCommand = async () => {
    await navigator.clipboard.writeText(server.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-surface-0 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="gradient-orb w-[600px] h-[600px] bg-accent/30 -top-[200px] -right-[200px]"
          style={{ filter: 'blur(150px)' }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      </div>
      <div className="noise-overlay" />

      <div className="relative z-10">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className="text-text-muted hover:text-text-secondary transition-colors">
              Home
            </Link>
            <span className="text-text-muted">/</span>
            <Link
              href={`/?category=${server.category}`}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              {categoryLabels[server.category] || server.category}
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-text-primary">{server.name}</span>
          </nav>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <VoteButtons serverId={server.id} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-text-primary">{server.name}</h1>
                      {server.isOfficial ? (
                        <span className="badge badge-official">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Official
                        </span>
                      ) : (
                        <span className="badge badge-community">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          Community
                        </span>
                      )}
                    </div>
                    <a
                      href={server.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                    >
                      by {server.author}
                    </a>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <span
                        key={dot}
                        className={`rating-dot ${
                          dot <= server.rating ? 'rating-dot-filled' : 'rating-dot-empty'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-text-muted">{server.rating}/5 algorithm score</span>
                </div>

                {/* Description */}
                <p className="text-text-secondary mt-4">{server.description}</p>
              </div>

              {/* Install Command */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-6">
                <h2 className="text-sm font-medium text-text-primary mb-3">Installation</h2>
                <div className="code-block group/code relative">
                  <code className="text-sm text-text-secondary font-mono break-all pr-12">
                    {server.installCommand}
                  </code>
                  <button
                    onClick={copyCommand}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-surface-3 hover:bg-surface-4 transition-colors"
                    title="Copy command"
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-community" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Best For & Tags */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-6">
                <h2 className="text-sm font-medium text-text-primary mb-3">Best For</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {server.bestFor.map((use) => (
                    <span
                      key={use}
                      className="text-sm px-3 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20"
                    >
                      {use}
                    </span>
                  ))}
                </div>

                <h2 className="text-sm font-medium text-text-primary mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {server.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-md bg-surface-3 text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-6">
                <h2 className="text-lg font-medium text-text-primary mb-4">User Reviews</h2>
                <ReviewList serverId={server.id} serverName={server.name} />
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* GitHub Stats */}
              {server.stars !== undefined && (
                <div className="bg-surface-1 border border-border-subtle rounded-xl p-6">
                  <h2 className="text-sm font-medium text-text-primary mb-4">Repository Stats</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-muted flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        Stars
                      </span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatNumber(server.stars)}
                      </span>
                    </div>
                    {server.forks !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Forks
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {formatNumber(server.forks)}
                        </span>
                      </div>
                    )}
                    {server.openIssues !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Open Issues
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {formatNumber(server.openIssues)}
                        </span>
                      </div>
                    )}
                    {server.language && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          Language
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {server.language}
                        </span>
                      </div>
                    )}
                    {server.license && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          License
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {server.license}
                        </span>
                      </div>
                    )}
                    {server.lastUpdated && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Last Updated
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {server.lastUpdated}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-6">
                <h2 className="text-sm font-medium text-text-primary mb-4">Links</h2>
                <div className="space-y-3">
                  <a
                    href={server.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View on GitHub
                    <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  {server.npmPackage && (
                    <a
                      href={`https://www.npmjs.com/package/${server.npmPackage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z" />
                      </svg>
                      View on npm
                      <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-6">
                <h2 className="text-sm font-medium text-text-primary mb-3">Category</h2>
                <Link
                  href={`/?category=${server.category}`}
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {categoryLabels[server.category] || server.category}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
