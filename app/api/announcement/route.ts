import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/announcement - Get all announcements
export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch announcements
    const { data: announcements, error } = await supabase
      .from("announcement")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    // Fetch profiles for all unique user IDs
    if (announcements && announcements.length > 0) {
      const userIds = [...new Set(announcements.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from("profile")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      // Map profiles to announcements
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const announcementsWithProfiles = announcements.map(announcement => ({
        ...announcement,
        profile: profileMap.get(announcement.user_id) || null,
      }));

      return NextResponse.json({ announcements: announcementsWithProfiles }, { headers: corsHeaders });
    }

    return NextResponse.json({ announcements: [] }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error in GET /api/announcement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}

// POST /api/announcement - Create announcement (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("admin_user")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403, headers: corsHeaders },
      );
    }

    // Parse request body
    const body = await request.json();
    const { message } = body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Create announcement
    const { data: announcement, error: insertError } = await supabase
      .from("announcement")
      .insert({
        user_id: user.id,
        message: message.trim(),
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Error creating announcement:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500, headers: corsHeaders });
    }

    // Fetch profile separately
    const { data: profile } = await supabase
      .from("profile")
      .select("id, display_name, avatar_url")
      .eq("id", user.id)
      .single();

    const announcementWithProfile = {
      ...announcement,
      profile: profile || null,
    };

    return NextResponse.json({ announcement: announcementWithProfile }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error("Error in POST /api/announcement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
