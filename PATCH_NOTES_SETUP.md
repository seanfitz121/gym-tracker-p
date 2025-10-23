# Patch Notes Setup Guide

## Database Setup

### Run the Migration

Copy and paste the contents of `supabase/migrations/add_patch_notes.sql` into your Supabase SQL Editor and execute it.

Or using Supabase CLI:
```bash
supabase db push
```

### Verify Setup

```sql
SELECT * FROM patch_notes;
-- Should return empty result (no notes yet)
```

### Create Test Patch Note

```sql
-- Replace YOUR_USER_ID with your actual user ID
INSERT INTO patch_notes (author_id, version, title, content, published)
VALUES (
  'YOUR_USER_ID',
  '1.0.0',
  'Initial Release',
  '## New Features
- Workout tracking with sets, reps, and weight
- Personal record tracking
- Exercise charts and progress visualization
- Gamification system with XP and levels

## Getting Started
- Create an account to start tracking
- Log your first workout
- Watch your progress grow!',
  true
);
```

## Features

### Patch Note Structure
- **Version**: Semantic version (e.g., 1.2.0, 2.0.0-beta)
- **Title**: Brief description of the update
- **Content**: Detailed changelog with formatting
- **Published**: Draft/Published toggle
- **Author**: Automatically set to logged-in admin
- **Timestamps**: Created and updated dates

### Content Formatting
The content supports simple markdown-style formatting:

```
## Section Heading
- Bullet point item
- Another item

## Another Section
- More items
* Alternative bullet syntax

Regular paragraph text is also supported.
```

**Rendered as:**
- Section headings are bold and larger
- Bullet points have blue dots
- Clean spacing between sections
- Author attribution at bottom

### Access Control
- ✅ **All Users**: Can view published patch notes
- ✅ **Admins Only**: Can create, edit, delete, and view drafts
- ✅ **RLS**: Row-level security enforced

## Usage

### For Admins

1. **Navigate** to Patch Notes (FileText icon in profile dropdown)
2. **Click** "New Update" button
3. **Fill in:**
   - Version (e.g., 1.2.0)
   - Title (e.g., "Bug Fixes and Improvements")
   - Content (use formatting guide above)
   - Published toggle (on = visible to all)
4. **Click** "Create"

### Editing/Deleting
- Click "Edit" on any patch note
- Make changes
- Click "Update" or "Delete"

### For Users
- View all published patch notes
- See version badges and dates
- Read formatted content
- See who posted each update

## Content Examples

### Example 1: Feature Update
```
Version: 2.1.0
Title: New Blog Feature

Content:
## New Features
- Added blog functionality for fitness tips
- Admins can create and edit blog posts
- Cover images support
- Rich text formatting

## Improvements
- Faster page loads
- Better mobile navigation
- Updated UI components
```

### Example 2: Bug Fixes
```
Version: 1.5.1
Title: Critical Bug Fixes

Content:
## Bug Fixes
- Fixed rest timer not playing sound on completion
- Resolved workout save error for certain exercises
- Corrected XP calculation for streak bonuses
- Fixed avatar upload on iOS devices

## Performance
- Reduced initial page load time by 30%
- Optimized database queries
```

### Example 3: Breaking Changes
```
Version: 3.0.0
Title: Major Update - Database Migration Required

Content:
## Breaking Changes
- Migrated to new database schema
- Updated authentication system
- Changed API endpoints

## New Features
- Real-time workout sync
- Social features (coming soon)
- Advanced analytics

## Migration Guide
- Export your data before updating
- Follow the migration instructions
- Re-import if needed
```

## Navigation

Patch Notes appears in the profile dropdown:

```
User Profile ▼
├─ 📄 Patch Notes  ← New!
├─ 📰 Blog
├─ ❔ Tips & Guides
├─ ⚙️  Settings
└─ 🚪 Sign out
```

## Best Practices

### Versioning
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Increment MAJOR for breaking changes
- Increment MINOR for new features
- Increment PATCH for bug fixes

### Writing Updates
- Be concise and clear
- Group changes by category (Features, Fixes, etc.)
- Use bullet points for easy scanning
- Include relevant details

### Publishing Strategy
- Save as draft while writing
- Review before publishing
- Publish when changes go live
- Keep users informed regularly

## Deployment

```bash
# 1. Push code
git add .
git commit -m "Add patch notes feature"
git push origin main

# 2. Run migration in Supabase
# (Copy SQL from supabase/migrations/add_patch_notes.sql)

# 3. Test
# - Navigate to Patch Notes
# - Create test note as admin
# - Verify users can view published notes
```

---

**Your patch notes system is ready!** Keep your users informed about updates, fixes, and improvements! 📝

