/**
 * Naijaora order email alerts (backup to WhatsApp).
 * Deploy: npx supabase functions deploy naijaora-notify --no-verify-jwt
 * Secrets:
 *   RESEND_API_KEY
 *   NAIJAORA_OWNER_EMAIL=anastasia.vncnt65@gmail.com
 *   NAIJAORA_FROM_EMAIL=Naijaora Orders <onboarding@resend.dev>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type NotifyBody = {
  event?: 'order_placed' | 'payment_submitted';
  orderNumber?: string;
};

function formatItems(items: unknown): string {
  if (!Array.isArray(items)) return '—';
  return items
    .map((line) => {
      const row = line as { quantity?: number; name?: string; price?: number };
      const qty = row.quantity ?? 1;
      const name = row.name ?? 'Item';
      const price = typeof row.price === 'number' ? row.price.toFixed(2) : '—';
      return `${qty}× ${name} — $${price}`;
    })
    .join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = (await req.json()) as NotifyBody;
    const orderNumber = body.orderNumber?.trim();
    const event = body.event ?? 'order_placed';

    if (!orderNumber) {
      return new Response(JSON.stringify({ error: 'orderNumber required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: order, error } = await supabase
      .from('naijaora_orders')
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const ownerEmail =
      Deno.env.get('NAIJAORA_OWNER_EMAIL') ?? 'anastasia.vncnt65@gmail.com';
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail =
      Deno.env.get('NAIJAORA_FROM_EMAIL') ?? 'Naijaora Orders <onboarding@resend.dev>';

    const isPayment = event === 'payment_submitted';
    const subject = isPayment
      ? `[Naijaora] Payment received · ${orderNumber}`
      : `[Naijaora] New order · ${orderNumber}`;

    const text = [
      isPayment
        ? 'A customer confirmed payment (WhatsApp may also arrive).'
        : 'A new order was placed on Naijaora.',
      '',
      `Order: ${order.order_number}`,
      `Status: ${order.status}`,
      `Customer: ${order.customer_name}`,
      `Phone: ${order.phone}`,
      order.email ? `Email: ${order.email}` : '',
      '',
      'Items:',
      formatItems(order.items),
      '',
      `Total: $${Number(order.total).toFixed(2)}`,
      order.estimated_ready_at
        ? `Estimated ready: ${new Date(order.estimated_ready_at as string).toLocaleString('en-NZ')}`
        : '',
      '',
      isPayment && order.receipt_url
        ? `Bank receipt: ${order.receipt_url}`
        : isPayment
          ? 'Receipt: not attached'
          : 'Payment: pending',
      '',
      `Time (UTC): ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (!resendKey) {
      console.log('[naijaora-notify] RESEND_API_KEY not set. Log only:\n', text);
      return new Response(
        JSON.stringify({ ok: true, delivered: false, reason: 'no_resend_key' }),
        { headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [ownerEmail],
        subject,
        text,
      }),
    });

    if (!sent.ok) {
      const errText = await sent.text();
      console.error('[naijaora-notify] Resend error:', errText);
      return new Response(JSON.stringify({ error: 'Email failed', detail: errText }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, delivered: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[naijaora-notify]', e);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
