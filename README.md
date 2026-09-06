# Naijaora — Food ordering website

Hosted on **GitHub Pages** at [naijaora.com](https://naijaora.com) (commercial use OK).

## Local development

```bash
cd food-website
npm install
cp .env.example .env   # add Supabase URL + anon key
npm run dev
```

## Go live on GitHub Pages

### 1. Create a GitHub repo

Create a new repo named **`naijaora`** (public or private — Pages works with private on free accounts for user sites; for project sites public is simplest).

Push only the `food-website` folder as the repo root:

```bash
cd food-website
git init
git add .
git commit -m "Naijaora website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/naijaora.git
git push -u origin main
```

### 2. Add secrets (for orders)

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |

(Same values as in `food-website/.env`)

### 3. Turn on Pages

GitHub repo → **Settings → Pages**:

- Source: **GitHub Actions**

Push to `main` (or run the workflow manually). Site will appear at `https://YOUR_USERNAME.github.io/naijaora/` until the custom domain is set.

### 4. Connect naijaora.com

The repo already has `public/CNAME` = `naijaora.com`.

In GitHub → **Settings → Pages → Custom domain**:

1. Enter `naijaora.com`
2. Check **Enforce HTTPS** (after DNS works)

At your domain registrar (where you bought naijaora.com), add:

**A records** for `@` (root) pointing to GitHub Pages:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME** for `www`:

```
www  →  YOUR_USERNAME.github.io
```

DNS can take a few minutes to a few hours. Then https://naijaora.com should load.

## Order alerts

- **WhatsApp / Messenger** — customer sends after payment  
- **Email backup** — deploy `naijaora-notify` + Resend (see below)

```bash
npx supabase functions deploy naijaora-notify --no-verify-jwt
npx supabase secrets set RESEND_API_KEY=re_xxxxx
npx supabase secrets set NAIJAORA_OWNER_EMAIL=anastasia.vncnt65@gmail.com
```

## Business details

Edit `src/config/business.ts` (phone, bank, hours, Facebook page).
