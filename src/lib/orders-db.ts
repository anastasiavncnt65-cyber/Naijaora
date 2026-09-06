import { business } from '../config/business';
import { supabase, supabaseConfigured } from './supabase';
import type { CartLine, PlacedOrder } from '../types';

const PREP_MINUTES = business.prepMinutes;

type DbOrderInsert = {
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  items: CartLine[];
  subtotal: number;
  total: number;
  status: string;
};

export function getEstimatedReadyAt(from = new Date()): string {
  const ready = new Date(from.getTime() + PREP_MINUTES * 60_000);
  return ready.toISOString();
}

export function formatReadyTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NZ', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function buildOrderMessage(order: PlacedOrder): string {
  const items = order.lines
    .map((l) => `${l.quantity}x ${l.name} ($${(l.price * l.quantity).toFixed(2)})`)
    .join('\n');

  const isPaid = order.status === 'payment_submitted';

  return [
    isPaid
      ? `Hi Naijaora — I've paid for order ${order.orderNumber}`
      : `Hi Naijaora — new order ${order.orderNumber}`,
    '',
    `Name: ${order.form.name}`,
    `Phone: ${order.form.phone}`,
    order.form.email ? `Email: ${order.form.email}` : '',
    '',
    'Items:',
    items,
    '',
    `Total: $${order.total.toFixed(2)}`,
    isPaid ? 'Payment: sent (receipt attached below)' : 'Payment: pending',
    order.receiptUrl ? `Receipt: ${order.receiptUrl}` : '',
    order.estimatedReadyAt
      ? `Ready around: ${formatReadyTime(order.estimatedReadyAt)}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Opens WhatsApp to the business number with the order details pre-filled. */
export function buildWhatsAppUrl(order: PlacedOrder): string {
  return `https://wa.me/${business.contact.whatsapp}?text=${encodeURIComponent(buildOrderMessage(order))}`;
}

export function openWhatsApp(order: PlacedOrder) {
  window.open(buildWhatsAppUrl(order), '_blank', 'noopener,noreferrer');
}

/** Messenger page chat — Messenger can't pre-fill text, so we copy the order for paste. */
export function buildMessengerUrl(): string | null {
  const page = business.social.facebook.trim();
  if (!page) return null;
  const username = page
    .replace(/^https?:\/\/(www\.)?facebook\.com\//i, '')
    .replace(/^https?:\/\/m\.me\//i, '')
    .replace(/\/$/, '')
    .split('?')[0];
  if (!username) return null;
  return `https://m.me/${username}`;
}

export async function openMessenger(order: PlacedOrder): Promise<boolean> {
  const url = buildMessengerUrl();
  if (!url) return false;

  try {
    await navigator.clipboard.writeText(buildOrderMessage(order));
  } catch {
    // Clipboard may be blocked — still open Messenger
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/** Email backup to owner (Resend via Supabase edge function). Non-blocking. */
export async function notifyOwnerByEmail(
  event: 'order_placed' | 'payment_submitted',
  orderNumber: string,
): Promise<void> {
  if (!supabaseConfigured || !supabase) return;

  try {
    await supabase.functions.invoke('naijaora-notify', {
      body: { event, orderNumber },
    });
  } catch {
    // Email is backup — don't fail the order
  }
}

export async function uploadReceipt(orderNumber: string, file: File): Promise<string> {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Database not configured.');
  }

  const safeExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `receipts/${orderNumber}-${Date.now()}.${safeExt}`;

  const { error } = await supabase.storage.from('naijaora-receipts').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('naijaora-receipts').getPublicUrl(path);
  return data.publicUrl;
}

export async function saveOrder(order: PlacedOrder): Promise<PlacedOrder> {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Database not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const row: DbOrderInsert = {
    order_number: order.orderNumber,
    customer_name: order.form.name,
    phone: order.form.phone,
    email: order.form.email || null,
    items: order.lines,
    subtotal: order.subtotal,
    total: order.total,
    status: order.status,
  };

  const { data, error } = await supabase
    .from('naijaora_orders')
    .insert(row)
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  const saved = { ...order, id: data.id as string };

  // Email backup (WhatsApp is the main alert after payment)
  void notifyOwnerByEmail('order_placed', saved.orderNumber);

  return saved;
}

export async function confirmOrderPayment(
  order: PlacedOrder,
  receiptUrl: string,
): Promise<PlacedOrder> {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Database not configured.');
  }

  const paymentSubmittedAt = new Date().toISOString();
  const estimatedReadyAt = getEstimatedReadyAt(new Date(paymentSubmittedAt));

  const { error } = await supabase
    .from('naijaora_orders')
    .update({
      status: 'payment_submitted',
      payment_submitted_at: paymentSubmittedAt,
      estimated_ready_at: estimatedReadyAt,
      receipt_url: receiptUrl,
    })
    .eq('order_number', order.orderNumber);

  if (error) throw new Error(error.message);

  const updated: PlacedOrder = {
    ...order,
    status: 'payment_submitted',
    paymentSubmittedAt,
    estimatedReadyAt,
    receiptUrl,
  };

  // Email backup with receipt link (WhatsApp opens in the UI)
  void notifyOwnerByEmail('payment_submitted', order.orderNumber);

  return updated;
}

export async function fetchPopularItemIds(): Promise<Set<string>> {
  if (!supabaseConfigured || !supabase) return new Set();

  const { data, error } = await supabase
    .from('naijaora_popular_items')
    .select('item_id, order_count')
    .order('order_count', { ascending: false })
    .limit(3);

  if (error || !data) return new Set();

  return new Set(data.map((row) => row.item_id as string));
}

export { PREP_MINUTES };
