# Quick Start Guide - 5 Minutes to Your First Workout

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free)

## Step 1: Install (1 minute)

```bash
npm install
```

## Step 2: Supabase Setup (2 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it "Gym Tracker", choose a region, create

### Create Database
1. In Supabase dashboard → SQL Editor
2. Copy ALL content from `supabase/schema.sql`
3. Paste and click "Run"
4. ✅ Wait for success message

### Get Credentials
1. Settings → API
2. Copy "Project URL"
3. Copy "anon public" key

## Step 3: Configure Environment (30 seconds)

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=paste_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_anon_key_here
```

## Step 4: Run! (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000

## Step 5: Test! (1 minute)

1. Click "Get Started"
2. Sign up with email
3. Click "Start Workout"
4. Add an exercise (e.g., "Barbell Bench Press")
5. Add a set with weight and reps
6. Click "Finish Workout"

🎉 **Done!** You've logged your first workout!

## What's Next?

- ✅ Add more exercises and sets
- 📊 Check Progress page for charts
- 🏆 Hit a PR to see confetti!
- 📱 Install as PWA (Add to Home Screen)
- 🔥 Build your streak

## Troubleshooting

**Can't sign up?**
- Check Supabase → Authentication → Providers
- Enable "Email" provider
- For dev, disable email confirmation

**Database errors?**
- Verify schema.sql ran successfully
- Check RLS is enabled on all tables

**Build errors?**
- Run `npm install` again
- Delete `.next` folder and rebuild

**Need Help?**
- See [SETUP.md](SETUP.md) for detailed guide
- Check [README.md](README.md) for full docs

---

**That's it!** You're ready to track your fitness journey. 💪


