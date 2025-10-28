import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProgressPhotosPage } from '@/components/progress/progress-photos-page';

export const metadata = {
  title: 'Progress Photos | SF Gym Tracker',
  description: 'Track your transformation with progress photos',
};

export default async function ProgressPhotosPageRoute() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return <ProgressPhotosPage userId={user.id} />;
}

