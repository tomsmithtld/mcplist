'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ReviewForm } from './ReviewForm';

interface Review {
  id: number;
  server_id: string;
  user_id: string;
  user_name: string | null;
  user_image_url: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  helpful_count: number;
  created_at: string;
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

interface ReviewListProps {
  serverId: string;
  serverName: string;
}

export function ReviewList({ serverId, serverName }: ReviewListProps) {
  const { user, isSignedIn } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
    if (isSignedIn) {
      fetchUserReview();
    }
  }, [serverId, isSignedIn, page]);

  interface ReviewsResponse {
    reviews: Review[];
    stats: ReviewStats | null;
    pagination: { totalPages: number };
  }

  interface UserReviewResponse {
    review: Review | null;
  }

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?serverId=${serverId}&page=${page}&limit=5`);
      if (res.ok) {
        const data = await res.json() as ReviewsResponse;
        setReviews(data.reviews || []);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const res = await fetch(`/api/reviews/user?serverId=${serverId}`);
      if (res.ok) {
        const data = await res.json() as UserReviewResponse;
        setUserReview(data.review);
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleReviewSubmit = (newStats: ReviewStats) => {
    setStats(newStats);
    fetchReviews();
    fetchUserReview();
    setShowForm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-text-muted fill-none'
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
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-surface-2 rounded-lg" />
        <div className="h-32 bg-surface-2 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      {stats && stats.review_count > 0 && (
        <div className="bg-surface-2 border border-border-subtle rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary">
                {stats.average_rating.toFixed(1)}
              </div>
              <div className="mt-1">{renderStars(Math.round(stats.average_rating), 'md')}</div>
              <div className="text-xs text-text-muted mt-1">
                {stats.review_count} {stats.review_count === 1 ? 'review' : 'reviews'}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  rating === 5
                    ? stats.rating_5_count
                    : rating === 4
                    ? stats.rating_4_count
                    : rating === 3
                    ? stats.rating_3_count
                    : rating === 2
                    ? stats.rating_2_count
                    : stats.rating_1_count;
                const percentage = stats.review_count > 0 ? (count / stats.review_count) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 text-xs">
                    <span className="text-text-muted w-3">{rating}</span>
                    <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-text-muted w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Write/Edit Review Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-surface-2 border border-border-subtle hover:border-accent rounded-lg p-3 text-sm text-text-secondary hover:text-text-primary transition-colors text-center"
        >
          {userReview ? 'Edit your review' : 'Write a review'}
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          serverId={serverId}
          serverName={serverName}
          existingReview={
            userReview
              ? {
                  rating: userReview.rating,
                  title: userReview.title,
                  content: userReview.content,
                }
              : null
          }
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 && !showForm ? (
          <div className="text-center py-8 text-text-muted text-sm">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-surface-2 border rounded-lg p-4 ${
                isSignedIn && user?.id === review.user_id
                  ? 'border-accent/50'
                  : 'border-border-subtle'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.user_image_url ? (
                    <img
                      src={review.user_image_url}
                      alt={review.user_name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-text-muted text-sm font-medium">
                      {(review.user_name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">
                      {review.user_name || 'Anonymous'}
                    </span>
                    {isSignedIn && user?.id === review.user_id && (
                      <span className="text-2xs px-1.5 py-0.5 bg-accent/20 text-accent rounded">
                        You
                      </span>
                    )}
                    <span className="text-xs text-text-muted">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mt-1">{renderStars(review.rating)}</div>

                  {/* Title */}
                  {review.title && (
                    <h5 className="mt-2 text-sm font-medium text-text-primary">
                      {review.title}
                    </h5>
                  )}

                  {/* Content */}
                  {review.content && (
                    <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap">
                      {review.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm bg-surface-2 border border-border-subtle rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-3 transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm bg-surface-2 border border-border-subtle rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-3 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
