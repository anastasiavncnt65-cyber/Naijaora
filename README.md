# Naijaora — Food ordering website

Uses its **own** Supabase + Resend (separate from Charge).

Hosted on **GitHub Pages** → [naijaora.com](https://naijaora.com).

## Local development

```bash
cd food-website
npm install
# .env already points at the Naijaora Supabase project
npm run dev
```

## Backend (Naijaora-only)

- Supabase project: **Naijaora** (`rubgwvvkmiigrvcsjesc`)
- Dashboard: https://supabase.com/dashboard/project/rubgwvvkmiigrvcsjesc
- Migrations live in `food-website/supabase/migrations/`
- Edge function: `food-website/supabase/functions/naijaora-notify`

### Email alerts (separate Resend account)

1. Sign up at https://resend.com with **anastasia.vncnt65@gmail.com** (or a Naijaora-only account)
2. Create an API key
3. From `food-website` folder:

```powershell
cd c:\Users\Chyda\Charge\food-website
npx --yes supabase functions deploy naijaora-notify --project-ref rubgwvvkmiigrvcsjesc --no-verify-jwt
npx --yes supabase secrets set --project-ref rubgwvvkmiigrvcsjesc RESEND_API_KEY=re_YOUR_REAL_KEY
npx --yes supabase secrets set --project-ref rubgwvvkmiigrvcsjesc NAIJAORA_OWNER_EMAIL=anastasia.vncnt65@gmail.com
```

## GitHub Pages

Repo: `https://github.com/anastasiavncnt65-cyber/naijaora`

1. Push `food-website` as the repo root
2. **Settings → Secrets → Actions** add:
   - `VITE_SUPABASE_URL` = `https://rubgwvvkmiigrvcsjesc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (from `.env` or Supabase → Settings → API → anon key)
3. **Settings → Pages** → Source: **GitHub Actions**
4. Custom domain: `naijaora.com` + DNS A records to GitHub Pages

## Order alerts

- WhatsApp / Messenger (customer sends)
- Email backup via Resend → your Gmail
