export interface Announcement {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface AnnouncementWithProfile extends Announcement {
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

