'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VoteButtons } from './VoteButtons';

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

interface ServerCardProps {
  server: Server;
  index?: number;
}

export function ServerCard({ server, index = 0 }: ServerCardProps) {
  const [copied, setCopied] = useState(false);

  const copyCommand = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(server.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const staggerClass = index < 8 ? `stagger-${index + 1}` : '';

  return (
    <Link
      href={`/server/${server.id}`}
      className={`card-hover group border-gradient rounded-xl p-5 opacity-0 animate-fade-in-up ${staggerClass} block`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Vote Buttons */}
        <div className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
          <VoteButtons serverId={server.id} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-lg leading-tight truncate group-hover:text-accent transition-colors">
            {server.name}
          </h3>
          <a
            href={server.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            by {server.author}
          </a>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
        {server.description}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-4">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`rating-dot ${
              dot <= server.rating ? 'rating-dot-filled' : 'rating-dot-empty'
            }`}
          />
        ))}
        <span className="text-xs text-text-muted ml-1">{server.rating}/5</span>
      </div>

      {/* Best For Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {server.bestFor.slice(0, 3).map((use) => (
            <span
              key={use}
              className="text-2xs px-2 py-0.5 rounded-md bg-surface-3 text-text-secondary"
            >
              {use}
            </span>
          ))}
          {server.bestFor.length > 3 && (
            <span className="text-2xs px-2 py-0.5 rounded-md bg-surface-3 text-text-muted">
              +{server.bestFor.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Install Command */}
      <div className="code-block group/code relative mb-4">
        <code className="text-xs text-text-secondary font-mono break-all pr-8">
          {server.installCommand}
        </code>
        <button
          onClick={copyCommand}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-surface-3 hover:bg-surface-4 transition-colors opacity-0 group-hover/code:opacity-100"
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

      {/* Footer */}
      <a
        href={server.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
        View on GitHub
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </Link>
  );
}
