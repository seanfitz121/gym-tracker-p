-- Cleanup script to remove duplicate sample blog posts
-- This removes all sample blog posts based on their titles

DELETE FROM blog_post
WHERE title IN (
  'Understanding Your One Rep Max (1RM): A Complete Guide',
  'Progressive Overload: The Scientific Key to Muscle Growth',
  'Perfect Your Form: A Guide to Common Compound Lifts',
  'Recovery and Rest Days: Why They Matter More Than You Think',
  'Nutrition Timing for Strength Training: What the Science Says'
);

