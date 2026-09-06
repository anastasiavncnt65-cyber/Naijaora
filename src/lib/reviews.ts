import { supabase, supabaseConfigured } from './supabase';
import type { Review } from '../types';

export async function fetchReviews(): Promise<Review[]> {
  if (!supabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('naijaora_reviews')
    .select('id, customer_name, rating, comment, dish, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    name: row.customer_name as string,
    rating: row.rating as number,
    comment: row.comment as string,
    dish: (row.dish as string) || undefined,
    createdAt: row.created_at as string,
  }));
}

export async function submitReview(
  review: Omit<Review, 'id' | 'createdAt'>,
): Promise<Review> {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Database not configured. Reviews cannot be saved yet.');
  }

  const { data, error } = await supabase
    .from('naijaora_reviews')
    .insert({
      customer_name: review.name,
      rating: review.rating,
      comment: review.comment,
      dish: review.dish ?? null,
    })
    .select('id, customer_name, rating, comment, dish, created_at')
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id as string,
    name: data.customer_name as string,
    rating: data.rating as number,
    comment: data.comment as string,
    dish: (data.dish as string) || undefined,
    createdAt: data.created_at as string,
  };
}

export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function renderStars(rating: number): string {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}
