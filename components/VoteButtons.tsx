'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';

interface VoteButtonsProps {
  serverId: string;
  compact?: boolean;
  initialScore?: number;
}

interface VoteCountResponse {
  upvotes: number;
  downvotes: number;
  score: number;
}

interface UserVoteResponse {
  userVote: 'up' | 'down' | null;
}

interface VoteSubmitResponse {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: 'up' | 'down' | null;
}

export function VoteButtons({ serverId, compact = false, initialScore = 0 }: VoteButtonsProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    // Fetch vote count from API
    const fetchVotes = async () => {
      try {
        const res = await fetch(`/api/votes?serverId=${serverId}`);
        if (res.ok) {
          const data = await res.json() as VoteCountResponse;
          setScore(data.score);
        }
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };

    // Fetch user's vote if signed in
    const fetchUserVote = async () => {
      if (!isSignedIn) return;
      try {
        const res = await fetch(`/api/votes/user?serverId=${serverId}`);
        if (res.ok) {
          const data = await res.json() as UserVoteResponse;
          setUserVote(data.userVote);
        }
      } catch (error) {
        console.error('Error fetching user vote:', error);
      }
    };

    fetchVotes();
    if (isLoaded && isSignedIn) {
      fetchUserVote();
    }
  }, [serverId, isSignedIn, isLoaded]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!isSignedIn) {
      setShowSignIn(true);
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousScore = score;
    const previousVote = userVote;

    let newScore = score;
    let newUserVote: 'up' | 'down' | null = type;

    if (userVote === type) {
      // Toggle off
      newScore = type === 'up' ? score - 1 : score + 1;
      newUserVote = null;
    } else if (userVote) {
      // Switch vote
      newScore = type === 'up' ? score + 2 : score - 2;
    } else {
      // New vote
      newScore = type === 'up' ? score + 1 : score - 1;
    }

    setScore(newScore);
    setUserVote(newUserVote);
    setIsLoading(true);

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId,
          voteType: userVote === type ? 'remove' : type,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit vote');
      }

      const data = await res.json() as VoteSubmitResponse;
      setScore(data.score);
      setUserVote(data.userVote);
    } catch (error) {
      // Rollback on error
      console.error('Error submitting vote:', error);
      setScore(previousScore);
      setUserVote(previousVote);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in prompt modal
  const SignInPrompt = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSignIn(false)}>
      <div className="bg-surface-1 border border-border-subtle rounded-xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Sign in to vote</h3>
        <p className="text-text-muted text-sm mb-4">Create an account to vote on MCP servers, save favorites, and submit your own servers.</p>
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <button className="flex-1 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Sign in
            </button>
          </SignInButton>
          <button
            onClick={() => setShowSignIn(false)}
            className="flex-1 bg-surface-3 hover:bg-surface-4 text-text-secondary px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <>
        {showSignIn && <SignInPrompt />}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote('up')}
            disabled={isLoading}
            className={`p-1 rounded transition-colors ${
              userVote === 'up'
                ? 'text-community bg-community/10'
                : 'text-text-muted hover:text-community hover:bg-community/5'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isSignedIn ? "Upvote" : "Sign in to vote"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className={`text-xs font-medium min-w-[20px] text-center ${
            score > 0 ? 'text-community' : score < 0 ? 'text-red-400' : 'text-text-muted'
          }`}>
            {score}
          </span>
          <button
            onClick={() => handleVote('down')}
            disabled={isLoading}
            className={`p-1 rounded transition-colors ${
              userVote === 'down'
                ? 'text-red-400 bg-red-400/10'
                : 'text-text-muted hover:text-red-400 hover:bg-red-400/5'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isSignedIn ? "Downvote" : "Sign in to vote"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {showSignIn && <SignInPrompt />}
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={() => handleVote('up')}
          disabled={isLoading}
          className={`p-1.5 rounded-lg transition-all ${
            userVote === 'up'
              ? 'text-community bg-community/10 scale-110'
              : 'text-text-muted hover:text-community hover:bg-community/5'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isSignedIn ? "Upvote" : "Sign in to vote"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <span className={`text-sm font-semibold ${
          score > 0 ? 'text-community' : score < 0 ? 'text-red-400' : 'text-text-muted'
        }`}>
          {score}
        </span>
        <button
          onClick={() => handleVote('down')}
          disabled={isLoading}
          className={`p-1.5 rounded-lg transition-all ${
            userVote === 'down'
              ? 'text-red-400 bg-red-400/10 scale-110'
              : 'text-text-muted hover:text-red-400 hover:bg-red-400/5'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isSignedIn ? "Downvote" : "Sign in to vote"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </>
  );
}
