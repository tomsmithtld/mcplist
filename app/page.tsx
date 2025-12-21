'use client';

import { useState, useMemo } from 'react';
import serversData from '@/data/servers.json';
import { SearchBar } from '@/components/SearchBar';
import { ServerCard } from '@/components/ServerCard';
import { ServerListItem } from '@/components/ServerListItem';
import { ViewToggle } from '@/components/ViewToggle';

interface Server {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  authorUrl: string;
  githubUrl: string;
  installCommand: string;
  isOfficial: boolean;
  tags: string[];
  bestFor: string[];
  rating: number;
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

export default function Home() {
  const servers = serversData.servers as Server[];
  const categories = serversData.categories;

  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filter servers based on search and category
  const filteredServers = useMemo(() => {
    let result = servers;

    // Apply search filter
    if (searchResults !== null) {
      if (searchResults.length === 0) {
        return [];
      }
      result = result.filter((s) => searchResults.includes(s.id));
      // Maintain search result order
      result.sort((a, b) => searchResults.indexOf(a.id) - searchResults.indexOf(b.id));
    }

    // Apply category filter
    if (activeCategory) {
      result = result.filter((s) => s.category === activeCategory);
    }

    return result;
  }, [servers, searchResults, activeCategory]);

  // Group by category when not searching and no category filter
  const serversByCategory = useMemo(() => {
    if (searchResults !== null || activeCategory !== null) {
      return null;
    }
    return categories.reduce((acc, category) => {
      acc[category] = servers.filter((s) => s.category === category);
      return acc;
    }, {} as Record<string, Server[]>);
  }, [servers, categories, searchResults, activeCategory]);

  const officialCount = servers.filter((s) => s.isOfficial).length;
  const communityCount = servers.length - officialCount;

  return (
    <div className="min-h-screen bg-surface-0 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div
          className="gradient-orb w-[600px] h-[600px] bg-accent/30 -top-[200px] -right-[200px]"
          style={{ filter: 'blur(150px)' }}
        />
        <div
          className="gradient-orb w-[400px] h-[400px] bg-official/20 top-[50%] -left-[150px]"
          style={{ filter: 'blur(120px)' }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      </div>

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-surface-4/50 backdrop-blur-sm bg-surface-0/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary tracking-tight">
                    MCP<span className="text-accent">List</span>
                  </h1>
                  <p className="text-xs text-text-muted">Model Context Protocol Servers</p>
                </div>
              </div>
              <nav className="flex items-center gap-4">
                <a
                  href="https://github.com/modelcontextprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors hidden sm:block"
                >
                  What is MCP?
                </a>
                <a
                  href="https://github.com/modelcontextprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
                >
                  <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 tracking-tight animate-fade-in">
              The Directory of{' '}
              <span className="text-gradient">MCP Servers</span>
            </h2>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8 animate-fade-in stagger-1">
              Find and integrate the perfect Model Context Protocol servers for
              Claude Code, Claude Desktop, and other MCP clients.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-12 mb-12 animate-fade-in stagger-2">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-accent">{servers.length}</p>
                <p className="text-sm text-text-muted">Servers</p>
              </div>
              <div className="w-px h-10 bg-surface-4" />
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-official">{officialCount}</p>
                <p className="text-sm text-text-muted">Official</p>
              </div>
              <div className="w-px h-10 bg-surface-4" />
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-community">{communityCount}</p>
                <p className="text-sm text-text-muted">Community</p>
              </div>
            </div>

            {/* Search */}
            <div className="animate-fade-in stagger-3">
              <SearchBar
                servers={servers}
                onSearch={setSearchResults}
                onCategoryFilter={setActiveCategory}
                activeCategory={activeCategory}
                categories={categories}
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* View Controls */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-text-secondary">
              {searchResults !== null || activeCategory !== null ? (
                <>
                  Showing{' '}
                  <span className="text-text-primary font-medium">
                    {filteredServers.length}
                  </span>{' '}
                  {filteredServers.length === 1 ? 'server' : 'servers'}
                  {activeCategory && (
                    <> in <span className="text-accent">{categoryLabels[activeCategory]}</span></>
                  )}
                </>
              ) : (
                <>
                  Browse all{' '}
                  <span className="text-text-primary font-medium">{servers.length}</span>{' '}
                  servers
                </>
              )}
            </p>
            <ViewToggle view={view} onViewChange={setView} />
          </div>

          {/* Server Grid/List */}
          {searchResults !== null || activeCategory !== null ? (
            // Flat list when searching or filtering
            filteredServers.length > 0 ? (
              view === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredServers.map((server, i) => (
                    <ServerCard key={server.id} server={server} index={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredServers.map((server, i) => (
                    <ServerListItem key={server.id} server={server} index={i} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">No servers found</h3>
                <p className="text-text-muted">Try adjusting your search or filter criteria</p>
              </div>
            )
          ) : (
            // Grouped by category when not searching
            serversByCategory &&
            categories.map((category) => {
              const categoryServers = serversByCategory[category];
              if (!categoryServers || categoryServers.length === 0) return null;

              return (
                <section key={category} id={category} className="mb-16 scroll-mt-24">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">
                      {categoryLabels[category] || category}
                    </h2>
                    <span className="px-2.5 py-1 rounded-full bg-surface-3 text-sm text-text-muted">
                      {categoryServers.length}
                    </span>
                  </div>
                  {view === 'grid' ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {categoryServers.map((server, i) => (
                        <ServerCard key={server.id} server={server} index={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryServers.map((server, i) => (
                        <ServerListItem key={server.id} server={server} index={i} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-surface-4/50 bg-surface-1/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <p className="text-sm text-text-muted">
                  MCP Servers Directory
                </p>
              </div>
              <div className="flex items-center gap-6">
                <a
                  href="https://github.com/modelcontextprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  MCP Protocol
                </a>
                <a
                  href="https://github.com/modelcontextprotocol/servers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  Submit a Server
                </a>
              </div>
              <p className="text-xs text-text-muted">
                Last updated: {serversData.metadata.lastUpdated}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
