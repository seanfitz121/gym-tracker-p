# Setup Guide - SFWeb Gym Tracker

This guide will help you get the SFWeb Gym Tracker up and running.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd gym-web

# Install dependencies
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: "Gym Tracker" (or your choice)
   - Database Password: (save this!)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 3. Set Up Database

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" or press Cmd/Ctrl + Enter
5. Wait for all queries to execute successfully
6. You should see success messages for:
   - Tables created
   - Indexes created
   - RLS policies enabled
   - Functions and triggers created

### 4. Configure Environment Variables

1. In Supabase, go to **Settings** → **API**
2. Copy these values:
   - Project URL (starts with `https://`)
   - `anon` `public` key (long string)

3. Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test the App

1. Click "Get Started" or "Sign Up"
2. Create an account with your email
3. Check your email for confirmation link (if email is enabled)
4. Sign in and start logging workouts!

## Common Issues & Solutions

### Issue: "Invalid API key"
- **Solution**: Double-check your `.env.local` file has correct Supabase credentials
- Make sure there are no extra spaces or quotes
- Restart dev server after changing env variables

### Issue: "Failed to save workout"
- **Solution**: Check that RLS policies are enabled
- Go to Supabase → Authentication → Policies
- Make sure all tables have policies listed

### Issue: Database queries failing
- **Solution**: Verify schema was created correctly
- In Supabase SQL Editor, run: `SELECT * FROM profile;`
- Should return empty table (not error)

### Issue: Can't sign up
- **Solution**: Check Supabase Authentication settings
- Go to Authentication → Providers
- Make sure Email provider is enabled
- For development, you can disable email confirmation

## Optional Enhancements

### Enable Email Confirmation (Production)

1. In Supabase → Authentication → Email Templates
2. Customize confirmation email
3. Enable "Confirm email" in Auth settings

### Add Custom Domain

1. Deploy to Vercel (see Deployment section)
2. In Vercel, add your custom domain
3. Update Supabase auth settings with new domain
4. Update redirect URLs

### Add Analytics

```env
# Add to .env.local
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Update Supabase URLs

After deploying:
1. Copy your Vercel URL (e.g., `https://gym-tracker.vercel.app`)
2. In Supabase → Authentication → URL Configuration
3. Add to "Redirect URLs":
   - `https://your-domain.vercel.app/app/log`
   - `https://your-domain.vercel.app/auth`

## Next Steps

- [ ] Customize branding (logo, colors, name)
- [ ] Create app icons (see README for sizes needed)
- [ ] Test on mobile device
- [ ] Share with friends for beta testing
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure backup strategy

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review [Supabase docs](https://supabase.com/docs)
- Review [Next.js docs](https://nextjs.org/docs)
- Open an issue on GitHub

## Security Checklist

Before going to production:

- [ ] Enable email verification in Supabase Auth
- [ ] Set up rate limiting (Supabase has built-in)
- [ ] Review RLS policies are correctly configured
- [ ] Enable 2FA for your Supabase account
- [ ] Set up database backups
- [ ] Configure CORS if needed
- [ ] Review and update privacy policy with your details
- [ ] Add proper error handling for all edge cases

---

🎉 **You're all set!** Start logging your workouts and crushing PRs!


