# SFWeb Gym Tracker (MVP)

A lightning-fast mobile-first web app for tracking workouts, monitoring progress, and celebrating PRs. Built with modern web technologies for performance and SEO.

## 🚀 Features

### Core Functionality
- **Workout Logger**: Quick and intuitive exercise tracking with sets, reps, weight, and RPE
- **Progress Tracking**: Interactive charts showing 1RM estimates, top sets, and volume over time
- **Personal Records**: Automatic PR detection with celebration confetti
- **Templates**: Save and reuse workout routines
- **History**: Complete workout history with detailed session views

### Gamification
- **XP System**: Earn experience points for completing workouts and hitting PRs
- **Level Progression**: Level up with smooth XP curve
- **Streaks**: Daily workout streaks with forgiveness system
- **Badges**: Unlock achievements for consistency and milestones
- **Weekly Goals**: Set and track personalized weekly targets

### Technical Features
- **PWA Support**: Installable app with offline capabilities
- **SEO Optimized**: Server-side rendering with proper metadata
- **Mobile-First**: Optimized UI for touch and small screens
- **Real-time**: Instant updates and calculations
- **Secure**: Row-level security with Supabase

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (Postgres + Auth)
- **State**: Zustand for client state
- **Charts**: Recharts for progress visualization
- **Deployment**: Vercel (recommended)

## 📦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gym-web.git
cd gym-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Go to your Supabase project SQL editor
- Run the SQL from `supabase/schema.sql`
- This will create all tables, policies, and triggers

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database Setup

The database schema includes:
- `profile` - User profiles
- `exercise` - Exercise library (user-specific)
- `workout_session` - Workout sessions
- `set_entry` - Individual sets
- `personal_record` - PR tracking
- `template` - Workout templates
- `user_gamification` - XP, levels, streaks, badges

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## 🎨 Customization

### Default Exercises
Edit `lib/constants/exercises.ts` to modify the default exercise library.

### Gamification Rules
Adjust XP rewards and level calculations in:
- `lib/utils/calculations.ts` - Level formula
- `components/workout/workout-logger.tsx` - XP awards

### UI Theme
Modify Tailwind config and shadcn theme in:
- `tailwind.config.ts`
- `app/globals.css`

## 📱 PWA Configuration

The app is configured as a PWA with:
- Service worker for offline support (`public/sw.js`)
- Web app manifest (`public/manifest.json`)
- Install prompt component
- Offline fallback page

### Generating Icons
You'll need to create app icons:
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)
- `public/apple-touch-icon.png` (180x180)
- `public/favicon.ico`

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## 📊 Features Roadmap

### MVP+ (Future Enhancements)
- [ ] Voice input for sets ("Bench 60 for 5")
- [ ] Weekly/monthly statistics summaries
- [ ] Exercise notes and form cues
- [ ] Workout tags (Push/Pull/Legs)
- [ ] Exercise video library
- [ ] Social features (friends, challenges)
- [ ] Export to PDF/CSV
- [ ] Apple Health / Google Fit integration
- [ ] Custom exercise creation form
- [ ] Advanced charts with body weight tracking

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Supabase](https://supabase.com/) for backend infrastructure
- [Recharts](https://recharts.org/) for charting
- [Vercel](https://vercel.com/) for hosting

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@plateprogress.com

---

Built with 💪 by Plate Progress
