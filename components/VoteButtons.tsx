'use client';

import { useState, useEffect } from 'react';

interface VoteButtonsProps {
  serverId: string;
  compact?: boolean;
}

export function VoteButtons({ serverId, compact = false }: VoteButtonsProps) {
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    // Load from localStorage
    const storedVotes = localStorage.getItem(`votes_${serverId}`);
    const storedUserVote = localStorage.getItem(`user_vote_${serverId}`);

    if (storedVotes) {
      setVotes(parseInt(storedVotes, 10));
    }
    if (storedUserVote) {
      setUserVote(storedUserVote as 'up' | 'down');
    }
  }, [serverId]);

  const handleVote = (type: 'up' | 'down') => {
    let newVotes = votes;
    let newUserVote: 'up' | 'down' | null = type;

    if (userVote === type) {
      // Undo vote
      newVotes = type === 'up' ? votes - 1 : votes + 1;
      newUserVote = null;
    } else if (userVote) {
      // Switch vote
      newVotes = type === 'up' ? votes + 2 : votes - 2;
    } else {
      // New vote
      newVotes = type === 'up' ? votes + 1 : votes - 1;
    }

    setVotes(newVotes);
    setUserVote(newUserVote);

    // Save to localStorage
    localStorage.setItem(`votes_${serverId}`, newVotes.toString());
    if (newUserVote) {
      localStorage.setItem(`user_vote_${serverId}`, newUserVote);
    } else {
      localStorage.removeItem(`user_vote_${serverId}`);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleVote('up')}
          className={`p-1 rounded transition-colors ${
            userVote === 'up'
              ? 'text-community bg-community/10'
              : 'text-text-muted hover:text-community hover:bg-community/5'
          }`}
          title="Upvote"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <span className={`text-xs font-medium min-w-[20px] text-center ${
          votes > 0 ? 'text-community' : votes < 0 ? 'text-red-400' : 'text-text-muted'
        }`}>
          {votes}
        </span>
        <button
          onClick={() => handleVote('down')}
          className={`p-1 rounded transition-colors ${
            userVote === 'down'
              ? 'text-red-400 bg-red-400/10'
              : 'text-text-muted hover:text-red-400 hover:bg-red-400/5'
          }`}
          title="Downvote"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => handleVote('up')}
        className={`p-1.5 rounded-lg transition-all ${
          userVote === 'up'
            ? 'text-community bg-community/10 scale-110'
            : 'text-text-muted hover:text-community hover:bg-community/5'
        }`}
        title="Upvote"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <span className={`text-sm font-semibold ${
        votes > 0 ? 'text-community' : votes < 0 ? 'text-red-400' : 'text-text-muted'
      }`}>
        {votes}
      </span>
      <button
        onClick={() => handleVote('down')}
        className={`p-1.5 rounded-lg transition-all ${
          userVote === 'down'
            ? 'text-red-400 bg-red-400/10 scale-110'
            : 'text-text-muted hover:text-red-400 hover:bg-red-400/5'
        }`}
        title="Downvote"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
