'use client';

import { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';

interface ReviewFormProps {
  serverId: string;
  serverName: string;
  existingReview?: {
    rating: number;
    title: string | null;
    content: string | null;
  } | null;
  onSubmit?: (stats: ReviewStats) => void;
  onCancel?: () => void;
}

interface ReviewStats {
  server_id: string;
  review_count: number;
  average_rating: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
}

export function ReviewForm({ serverId, serverName, existingReview, onSubmit, onCancel }: ReviewFormProps) {
  const { isSignedIn } = useUser();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) return;
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId,
          rating,
          title: title.trim() || null,
          content: content.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to submit review');
      }

      const data = await res.json() as { stats?: ReviewStats };
      setSuccess(true);

      if (onSubmit && data.stats) {
        onSubmit(data.stats);
      }

      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
        if (!existingReview && onCancel) {
          onCancel();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="bg-surface-2 border border-border-subtle rounded-lg p-4 text-center">
        <p className="text-text-muted text-sm mb-3">Sign in to write a review</p>
        <SignInButton mode="modal">
          <button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Sign in
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-2 border border-border-subtle rounded-lg p-4">
      <h4 className="text-sm font-medium text-text-primary mb-3">
        {existingReview ? 'Edit your review' : `Review ${serverName}`}
      </h4>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-xs text-text-muted mb-2">Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-text-muted fill-none'
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-text-secondary ml-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Great'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-3">
        <label className="block text-xs text-text-muted mb-1">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className="w-full bg-surface-1 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-xs text-text-muted mb-1">Review (optional)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience using this MCP server..."
          rows={3}
          maxLength={1000}
          className="w-full bg-surface-1 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
        />
        <div className="text-right text-xs text-text-muted mt-1">
          {content.length}/1000
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-3 text-sm text-community bg-community/10 px-3 py-2 rounded-lg">
          Review submitted successfully!
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-surface-3 hover:bg-surface-4 text-text-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
