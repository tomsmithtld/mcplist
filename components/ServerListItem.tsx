'use client';

import { useState } from 'react';

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

interface ServerListItemProps {
  server: Server;
  index?: number;
}

export function ServerListItem({ server, index = 0 }: ServerListItemProps) {
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(server.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const staggerClass = index < 8 ? `stagger-${index + 1}` : '';

  return (
    <div
      className={`card-hover group border-gradient rounded-lg p-4 opacity-0 animate-fade-in-up ${staggerClass} flex items-center gap-4`}
    >
      {/* Left: Name and Author */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
            {server.name}
          </h3>
          {server.isOfficial ? (
            <span className="badge badge-official text-2xs py-0.5">Official</span>
          ) : (
            <span className="badge badge-community text-2xs py-0.5">Community</span>
          )}
        </div>
        <p className="text-sm text-text-muted truncate">
          by {server.author}
        </p>
      </div>

      {/* Center: Description */}
      <p className="hidden lg:block flex-1 text-sm text-text-secondary truncate max-w-md">
        {server.description}
      </p>

      {/* Rating */}
      <div className="hidden md:flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`rating-dot ${
              dot <= server.rating ? 'rating-dot-filled' : 'rating-dot-empty'
            }`}
          />
        ))}
      </div>

      {/* Install Command */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <code className="text-xs text-text-muted font-mono bg-surface-2 px-2 py-1 rounded max-w-[200px] truncate">
          {server.installCommand}
        </code>
        <button
          onClick={copyCommand}
          className="p-1.5 rounded-md bg-surface-3 hover:bg-surface-4 transition-colors"
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

      {/* GitHub Link */}
      <a
        href={server.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-md text-text-muted hover:text-accent hover:bg-surface-3 transition-all"
        title="View on GitHub"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      </a>
    </div>
  );
}
