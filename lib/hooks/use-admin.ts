"use client";

import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";

export function useIsAdmin(userId?: string) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("admin_user")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no row exists

        // Only log actual errors, not "no row found"
        if (error && error.code !== 'PGRST116') {
          console.error("Error checking admin status:", error);
        }
        
        setIsAdmin(!!data);
      } catch (error) {
        // Silently handle - user is simply not an admin
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [userId]);

  return { isAdmin, loading };
}

