-- Sample blog posts for AdSense approval
-- These posts provide quality content for Google to crawl and serve relevant ads
-- Run this SQL in your Supabase SQL Editor

-- Note: Replace 'YOUR_ADMIN_USER_ID' with an actual admin user ID from your profile table
-- Or create posts without author_id (will need to adjust the query)

INSERT INTO blog_post (title, subtitle, body, slug, published, created_at, updated_at)
VALUES 
(
  'Understanding Your One Rep Max (1RM): A Complete Guide',
  'Learn how to calculate and use your 1RM for better training results',
  E'# What is a One Rep Max (1RM)?

Your One Rep Max, or 1RM, is the maximum weight you can lift for a single repetition of a given exercise with proper form. It''s one of the most important metrics in strength training and serves as the foundation for programming effective workouts.

## Why Your 1RM Matters

Understanding your 1RM helps you:

**Training Intensity**: Calculate the right weight for different rep ranges. For example, 80% of your 1RM is typically used for 5-8 reps, while 65% works well for 12-15 reps.

**Progress Tracking**: Watching your 1RM increase over time is one of the best indicators that your training is working.

**Program Design**: Many effective strength programs are based on percentages of your 1RM, like 5/3/1, Wendler, and Texas Method.

## How to Calculate Your 1RM

You don''t need to actually test your 1RM to know it. Instead, use a proven formula based on a recent heavy set:

**Epley Formula**: 1RM = Weight × (1 + Reps / 30)
**Brzycki Formula**: 1RM = Weight / (1.0278 - 0.0278 × Reps)
**Lombardi Formula**: 1RM = Weight × Reps^0.1

For best accuracy, use a set in the 3-8 rep range. Sets above 10 reps become less accurate for 1RM estimation.

## Example Calculation

Let''s say you just benched 225 lbs for 5 reps. Using the Epley formula:

1RM = 225 × (1 + 5/30) = 225 × 1.167 = 262.5 lbs

This means your estimated 1RM for bench press is approximately 263 lbs.

## Using Your 1RM for Training

Once you know your 1RM, you can program your training:

- **Strength (1-5 reps)**: 85-100% of 1RM
- **Hypertrophy (6-12 reps)**: 65-85% of 1RM
- **Endurance (12+ reps)**: 50-65% of 1RM

## Important Considerations

**Don''t Max Out Often**: Testing your true 1RM is taxing on your nervous system and carries injury risk. Use calculated estimates instead.

**Update Regularly**: Retest or recalculate every 4-6 weeks as you get stronger.

**Exercise-Specific**: Your 1RM is different for each exercise. Track them separately.

**Form Matters**: A 1RM only counts if performed with proper form. Don''t sacrifice technique for weight.

## Track Your 1RM with Plate Progress

Plate Progress automatically calculates your estimated 1RM for every exercise based on your workout logs. You can see how your strength progresses over time with beautiful charts and automatic PR detection.

Ready to start tracking? Sign up for free and see your 1RM estimates for all your lifts!',
  'understanding-one-rep-max-1rm-guide',
  true,
  NOW(),
  NOW()
),
(
  'Progressive Overload: The Scientific Key to Muscle Growth',
  'How to apply progressive overload for continuous gains in size and strength',
  E'# What is Progressive Overload?

Progressive overload is the gradual increase of stress placed upon the body during exercise. It''s the single most important principle for building muscle and strength. Without progressive overload, your body has no reason to adapt and grow.

## The Science Behind Progressive Overload

When you lift weights, you create micro-tears in muscle fibers. Your body repairs these tears, making the muscle slightly stronger to handle future stress. But here''s the key: your body only adapts enough to handle the current demand.

If you always bench press 135 lbs for 3 sets of 10, your body will adapt to handle exactly that - and then stop. To keep growing, you must progressively increase the demand.

## Five Ways to Apply Progressive Overload

### 1. Increase Weight
The most obvious method: lift heavier weight for the same reps and sets.

**Example**: Squat 225 lbs for 3x5, then next week try 230 lbs for 3x5.

### 2. Increase Reps
Keep the weight the same but do more reps per set.

**Example**: Bench 185 lbs for 3 sets of 8, then aim for 3 sets of 9 next session.

### 3. Increase Sets
Add another set to your exercise while keeping weight and reps constant.

**Example**: Deadlift 315 lbs for 3 sets of 5, then progress to 4 sets of 5.

### 4. Increase Frequency
Train the same muscle group more often per week.

**Example**: Train chest once per week, then progress to twice per week.

### 5. Decrease Rest Time
Reduce rest between sets while maintaining weight and reps.

**Example**: Rest 3 minutes between sets, then reduce to 2.5 minutes.

## The Best Method for Beginners

For beginners, increasing weight is the most effective method. Follow this simple progression:

**Week 1**: 135 lbs × 3 sets × 8 reps
**Week 2**: 140 lbs × 3 sets × 8 reps  
**Week 3**: 145 lbs × 3 sets × 8 reps
**Week 4**: Deload - 135 lbs × 3 sets × 8 reps

This linear progression works incredibly well for the first 6-12 months of training.

## Common Mistakes to Avoid

**Too Much, Too Fast**: Adding 10-20 lbs per week leads to injury and burnout. Increase by 2.5-5 lbs for upper body, 5-10 lbs for lower body.

**Sacrificing Form**: Increased weight means nothing if your form deteriorates. Quality > quantity.

**No Deload Weeks**: Take a deload week (reduce volume/intensity by 40-50%) every 4-6 weeks to allow recovery.

**Not Tracking**: You can''t progress what you don''t measure. Log every workout!

## Advanced Progressive Overload

Once linear progression stalls, use these advanced methods:

**Double Progression**: Progress reps first (8-12), then increase weight and drop back to 8 reps.

**Wave Loading**: Vary intensity week to week (heavy, medium, light).

**Periodization**: Plan training in blocks focusing on different adaptations.

## How to Track Progressive Overload

The best way to ensure progressive overload is to track every workout. Record:

- Exercise name
- Weight lifted
- Sets and reps completed
- RPE (rate of perceived exertion)
- Date

Plate Progress makes this incredibly easy. Just log your workouts and the app automatically:

✓ Tracks volume and intensity trends
✓ Detects new PRs automatically  
✓ Shows progress charts for every exercise
✓ Suggests when to increase weight

## The Bottom Line

Progressive overload isn''t optional - it''s required for muscle growth and strength gains. Pick your method, track your workouts, and make small increases consistently.

The lifters who see the best results aren''t the ones who train the hardest in a single session. They''re the ones who progressively increase their performance week after week, month after month, year after year.

Start tracking your progressive overload today with Plate Progress. Your future self will thank you!',
  'progressive-overload-muscle-growth-guide',
  true,
  NOW(),
  NOW()
),
(
  'How to Track Workout Volume: Sets, Reps, and Total Tonnage',
  'Master the metrics that matter for building muscle and strength',
  E'# Understanding Workout Volume

Training volume is one of the most important variables in your workout program. It determines how much stimulus you''re providing to your muscles and directly impacts your results. But what exactly is volume, and how should you track it?

## What is Training Volume?

Training volume can be measured in several ways:

**Volume Sets**: Total number of hard sets per muscle group per week. This is the simplest and most commonly used metric.

**Volume Load (Tonnage)**: Total weight lifted calculated as: Sets × Reps × Weight

**Volume Reps**: Total number of reps performed for a muscle group.

## Why Volume Matters

Research consistently shows that higher training volumes lead to more muscle growth, up to a point. The key findings:

- **Minimum Effective Volume**: About 10 sets per muscle group per week for maintenance
- **Maximum Adaptive Volume**: Around 20-25 sets per muscle group per week for most people  
- **Maximum Recoverable Volume**: Varies by individual, but typically 25-30+ sets

## Calculating Your Volume

Let''s use an example chest workout:

**Bench Press**: 4 sets × 8 reps × 185 lbs = 5,920 lbs
**Incline Dumbbell Press**: 3 sets × 10 reps × 60 lbs (per hand) = 3,600 lbs
**Cable Flyes**: 3 sets × 12 reps × 40 lbs = 1,440 lbs

**Total Chest Volume**: 10 sets (volume sets)
**Total Chest Tonnage**: 10,960 lbs (volume load)

## How Much Volume Do You Need?

The answer depends on your goals:

### For Muscle Growth (Hypertrophy)
**Beginners**: 10-15 sets per muscle group per week
**Intermediate**: 15-20 sets per muscle group per week  
**Advanced**: 20-25+ sets per muscle group per week

### For Strength
Focus less on total volume, more on intensity:
**Main Lifts**: 10-15 sets per week at 80-90% 1RM
**Assistance Work**: 8-12 sets per week

### For Endurance
Higher volume, lower intensity:
**20-30+ sets per muscle group per week at 50-70% 1RM**

## Tracking Volume Over Time

The key to progress is tracking your volume trends:

**Weekly Volume**: Sum all sets for each muscle group per week
**Monthly Average**: Calculate average weekly volume for the month
**Volume Progression**: Increase by 10-15% every 3-4 weeks

## Example Volume Progression

**Weeks 1-3**: 15 sets per muscle group per week
**Weeks 4**: Deload - 9 sets per muscle group  
**Weeks 5-7**: 17 sets per muscle group per week
**Week 8**: Deload - 10 sets per muscle group
**Weeks 9-11**: 19 sets per muscle group per week

## Common Volume Mistakes

**Too Much Too Soon**: Jumping from 12 sets to 25 sets per week causes excessive fatigue and poor recovery.

**Not Tracking**: You can''t manage what you don''t measure. Log every set!

**Ignoring Recovery**: Volume must be balanced with recovery capacity. More isn''t always better.

**Counting Junk Volume**: Only count hard sets (within 0-3 reps of failure). Warmup sets don''t count.

## How Plate Progress Helps

Manually calculating volume is tedious. Plate Progress automatically:

✓ Calculates total volume per muscle group
✓ Tracks weekly volume trends with charts
✓ Shows volume load (tonnage) for every exercise  
✓ Alerts you when volume changes significantly
✓ Suggests optimal volume increases

## Optimizing Your Volume

**Start Conservative**: Begin at the lower end of the recommended range
**Increase Gradually**: Add 1-2 sets per muscle group every 2-3 weeks  
**Deload Regularly**: Reduce volume by 40-50% every 4-6 weeks
**Listen to Your Body**: Reduce volume if recovery suffers

## Volume Landmarks (Per Muscle Group Per Week)

**Minimum Effective**: 10 sets  
**Sweet Spot for Growth**: 15-20 sets
**Maximum for Most**: 25 sets
**Beyond Recovery**: 30+ sets

## The Bottom Line

Training volume is a crucial variable you must track and optimize. Start with 12-15 sets per muscle group per week, increase gradually, and deload regularly.

The lifters who track their volume and adjust based on results will always outperform those who train randomly.

Ready to optimize your training volume? Plate Progress makes it effortless. Start tracking today!',
  'tracking-workout-volume-guide',
  true,
  NOW(),
  NOW()
),
(
  'Plate Calculator Guide: Load Your Barbell Fast and Accurately',
  'Save time and avoid math errors with a plate calculator for your workouts',
  E'# Why Use a Plate Calculator?

You''re at the squat rack, ready to load 315 lbs for your working set. Do you reach for 3 plates per side? Or is it 2 plates, a 25, and a 10? Wait, does that even add up right?

If you''ve ever stood at a loaded barbell second-guessing your math, a plate calculator is your solution.

## What is a Plate Calculator?

A plate calculator is a simple tool that tells you exactly which plates to load on each side of the barbell to reach your target weight. It accounts for:

- The bar weight (standard 45 lbs, or women''s 35 lbs, or custom)
- Available plates (45s, 25s, 10s, 5s, 2.5s)
- The most efficient combination

## How It Works

**Input**: Target weight (e.g., 315 lbs)
**Bar**: 45 lbs (standard Olympic barbell)  
**Remaining**: 315 - 45 = 270 lbs
**Per Side**: 270 ÷ 2 = 135 lbs

**Optimal Loading**:
- 3 × 45 lb plates (135 lbs) per side
- Total: 45 lb bar + 270 lbs = 315 lbs ✓

## Benefits of Using a Plate Calculator

### 1. Save Time
No more mental math between sets while you''re fatigued. Get the answer instantly.

### 2. Avoid Errors
Loading the wrong weight is dangerous and wastes your workout. A calculator prevents mistakes.

### 3. Minimize Plate Changes
The calculator uses the fewest plates possible, making loading and unloading faster.

### 4. Learn Efficient Loading
Over time, you''ll memorize common combinations (225 = 2 plates, 315 = 3 plates, etc.)

## Common Weight Combinations

Memorize these standards for quick loading:

**135 lbs**: 1 × 45 lb plate per side  
**185 lbs**: 1 × 45 + 1 × 25 per side
**225 lbs**: 2 × 45 lb plates per side
**275 lbs**: 2 × 45 + 1 × 25 per side  
**315 lbs**: 3 × 45 lb plates per side
**405 lbs**: 4 × 45 lb plates per side

## Special Considerations

### Different Bars
- **Standard Olympic Bar**: 45 lbs (20 kg)
- **Women''s Bar**: 35 lbs (15 kg)  
- **Deadlift Bar**: 45 lbs (20 kg)
- **Safety Squat Bar**: 60-70 lbs
- **Trap Bar**: 45-60 lbs

Always know your bar weight!

### Metric Plates
If your gym uses kg plates:

**20 kg plate** = 44 lbs (red)
**15 kg plate** = 33 lbs (yellow)  
**10 kg plate** = 22 lbs (green)
**5 kg plate** = 11 lbs (white)
**2.5 kg plate** = 5.5 lbs (red)

### Micro Plates
For small jumps (2.5-5 lbs total), use:
- **1.25 lb plates** (0.5 kg) per side = +2.5 lbs total
- **2.5 lb plates** (1 kg) per side = +5 lbs total

## Using Plate Progress Calculator

The Plate Progress plate calculator features:

✓ Instant calculation as you type  
✓ Supports all bar weights (45, 35, custom)
✓ Shows plates per side visually
✓ Metric and imperial units
✓ Accounts for available plates
✓ Mobile-optimized for gym use

## Pro Tips

**Start Heavy**: Load heaviest plates first (45s), then smaller ones. This keeps the bar balanced.

**Match Heights**: Use the same type of plates on both sides to keep the bar level.

**Use Collars**: Always use collars to secure plates, especially on heavy sets.

**Unload Symmetrically**: Remove plates from both sides alternately to keep the bar balanced.

## Example Workout

You''re running 5/3/1 for squats. This week''s sets:

**Warmup**: 135 lbs → 1 plate per side  
**Working Set 1**: 225 lbs → 2 plates per side
**Working Set 2**: 255 lbs → 2 plates + 1 twenty-five per side
**Working Set 3 (AMRAP)**: 280 lbs → 2 plates + 1 twenty-five + 1 five per side

With a plate calculator, you know exactly what to load before you even start.

## Common Plate Loading Errors

**Forgetting the Bar**: You need 225 lbs total, but that INCLUDES the 45 lb bar. Load 180 lbs of plates (90 per side).

**Uneven Loading**: Always load the same plates on both sides. An unbalanced bar is dangerous.

**Using Too Many Plates**: Loading 10 × 10 lb plates when 1 × 45 + 1 × 25 + 1 × 10 would work is inefficient.

## The Math

For those who want to understand the algorithm:

```
Target Weight = Bar + (Plates Per Side × 2)
Plates Per Side = (Target Weight - Bar) ÷ 2

Start with largest plate, subtract weight, repeat:
While remaining weight > 0:
  Use largest plate that fits
  Subtract from remaining weight
```

## The Bottom Line

A plate calculator is a small tool that makes your training more efficient and safer. Whether you use a standalone calculator or one built into your workout tracker, you''ll save time and avoid errors.

Try the Plate Progress plate calculator - it''s free, fast, and mobile-friendly. Focus on your lifts, not the math!',
  'plate-calculator-guide-barbell-loading',
  true,
  NOW(),
  NOW()
),
(
  'RPE Training: Rate of Perceived Exertion for Smart Programming',
  'Learn how to use RPE to auto-regulate your training intensity',
  E'# What is RPE?

RPE stands for Rate of Perceived Exertion, and in the context of strength training, it refers to how many reps you have left "in the tank" after completing a set. It''s also called RIR (Reps in Reserve).

## The RPE Scale

**RPE 10**: Absolute max - could not do another rep
**RPE 9.5**: Could maybe do 1 more rep  
**RPE 9**: Could definitely do 1 more rep
**RPE 8.5**: Could do 1-2 more reps
**RPE 8**: Could do 2 more reps  
**RPE 7.5**: Could do 2-3 more reps
**RPE 7**: Could do 3 more reps
**RPE 6 and below**: 4+ reps left in the tank

## Why Use RPE?

Traditional percentage-based training (e.g., "do 80% of 1RM for 5 reps") has a problem: your strength varies day to day. Bad sleep, stress, and recovery status all affect performance.

RPE solves this by auto-regulating based on how you feel TODAY:

**Good Day**: RPE 8 might be 225 lbs × 5 reps  
**Bad Day**: RPE 8 might be 215 lbs × 5 reps

You still get the right training stimulus without overtaxing yourself.

## RPE for Different Goals

### Strength Training
**Main Lifts**: RPE 7-9  
**Assistance Work**: RPE 6-8

Example:
- Squats: 5 sets of 3 reps @ RPE 8
- Romanian Deadlifts: 3 sets of 8 reps @ RPE 7

### Hypertrophy (Muscle Growth)  
**Primary Exercises**: RPE 7-9
**Isolation**: RPE 6-8

Example:
- Bench Press: 4 sets of 8 reps @ RPE 8
- Cable Flyes: 3 sets of 12 reps @ RPE 7

### Deload Weeks
**All Exercises**: RPE 5-6

This allows recovery while maintaining movement patterns.

## How to Implement RPE

### Week 1: Learn the Scale
Practice rating your sets. After each set, ask:
- "How many more reps could I have done?"
- "Was I close to failure?"

### Week 2-4: Apply to Training
Replace percentage-based programming with RPE targets:

**Old**: Bench 225 lbs for 3 sets of 5 (80% 1RM)  
**New**: Bench for 3 sets of 5 @ RPE 8

Adjust weight up or down to hit the target RPE.

### Week 5+: Fine-Tune
You''ll develop an accurate feel for RPE. Use it to:
- Push harder on good days
- Back off on rough days  
- Avoid overtraining
- Maximize progress

## RPE Accuracy

Beginners often underestimate RPE:
- You think it''s RPE 9 (1 rep left)
- Actually RPE 7 (3 reps left)

This comes with experience. Tips for accuracy:

**Take Sets to Failure Occasionally**: Test yourself once in a while to calibrate
**Use Video**: Record your sets. If the bar speed doesn''t slow down, you had more reps
**Be Honest**: Ego shouldn''t inflate your RPE

## RPE Programming Examples

### Strength-Focused (5x5 Program)
**Squats**: 5 sets of 5 @ RPE 8  
**Bench**: 5 sets of 5 @ RPE 8
**Deadlift**: 5 sets of 5 @ RPE 8

### Hypertrophy-Focused (PPL)
**Push Day**:
- Bench: 4 × 8 @ RPE 8
- Overhead Press: 3 × 10 @ RPE 8
- Dips: 3 × 12 @ RPE 7

**Pull Day**:
- Deadlift: 4 × 6 @ RPE 8  
- Rows: 4 × 10 @ RPE 7
- Pull-ups: 3 × 8 @ RPE 8

### Powerlifting Peaking
**Week 1**: 5 × 5 @ RPE 7
**Week 2**: 5 × 3 @ RPE 8  
**Week 3**: 5 × 2 @ RPE 9
**Week 4**: 3 × 1 @ RPE 9.5 (openers)
**Week 5**: Meet!

## Common RPE Mistakes

**Chasing RPE 10**: Training to failure every set leads to excessive fatigue. Most training should be RPE 7-8.

**Inconsistent Rating**: Being RPE 8 on Monday and RPE 10 on Wednesday with the same weight means your scale is off.

**Ignoring Poor Days**: If you feel terrible, respect the RPE system and reduce weight. Don''t force a number.

## RPE + Tracking

The best approach combines RPE with workout tracking:

1. Log weight, reps, sets  
2. Add RPE rating
3. Review trends over time
4. Adjust based on patterns

**Plate Progress** makes this effortless:
✓ Add optional RPE to every set
✓ Track RPE trends over time  
✓ See how RPE relates to PRs
✓ Smart suggestions based on history

## Scientific Backing

Research shows RPE-based training produces similar or better results than percentage-based training, especially for:

- Preventing overtraining
- Auto-regulation  
- Individual differences
- Non-linear progression

## The Bottom Line

RPE is a powerful tool for auto-regulating your training. It allows you to train hard when you''re fresh and back off when you''re beat up.

Start using RPE today:
1. Learn the 1-10 scale  
2. Rate every set honestly
3. Adjust weight to hit target RPE
4. Track patterns over time

Your body doesn''t know percentages - it knows effort. Train smart with RPE!',
  'rpe-training-guide-rate-perceived-exertion',
  true,
  NOW(),
  NOW()
);

-- Create an index on the slug for faster public queries
CREATE INDEX IF NOT EXISTS idx_blog_post_slug ON blog_post(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_published ON blog_post(published);

