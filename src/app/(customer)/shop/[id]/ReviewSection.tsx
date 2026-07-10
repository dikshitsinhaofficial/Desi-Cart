'use client';

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';

interface Review {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface Props {
  productId: string;
  initialReviews: Review[];
  initialRating: number;
}

export default function ReviewSection({ productId, initialReviews = [], initialRating = 0 }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(initialRating);
  
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please sign in to leave a review.');
    
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: user.email,
          rating: newRating,
          comment
        })
      });
      if (!res.ok) throw new Error();
      const updatedProduct = await res.json();
      
      setReviews(updatedProduct.reviewList || []);
      setRating(updatedProduct.rating);
      setComment('');
      setNewRating(5);
    } catch {
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 border-t border-slate-100 dark:border-slate-800 pt-10">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        <MessageSquare className="text-orange-500" /> Customer Reviews
      </h2>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Side: Stats */}
        <div className="w-full lg:w-80 shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl h-fit">
          <div className="text-center">
            <h3 className="text-6xl font-black text-slate-900 dark:text-white mb-2">{rating.toFixed(1)}</h3>
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
                />
              ))}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Based on {reviews.length} reviews</p>
          </div>
        </div>

        {/* Right Side: Reviews List & Write Review */}
        <div className="flex-1 space-y-8">
          
          {/* Write a Review */}
          {user ? (
            <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white">Write a customer review</h4>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Rating</label>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const stars = i + 1;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setNewRating(stars)}
                        onMouseEnter={() => setHoverRating(stars)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="transition-transform active:scale-95"
                      >
                        <Star
                          size={24}
                          className={(hoverRating !== null ? stars <= hoverRating : stars <= newRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="What did you like or dislike about this product?"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 dark:text-white transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Please <Link href="/login" className="text-orange-500 font-bold hover:underline">sign in</Link> to write a customer review.</p>
            </div>
          )}

          {/* List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((rev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{rev.user}</span>
                    <span className="text-xs text-slate-400">{new Date(rev.date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={14}
                        className={idx < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'}
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{rev.comment}</p>
                </motion.div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
