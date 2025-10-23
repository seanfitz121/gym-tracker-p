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
        const { data } = await supabase
          .from("admin_user")
          .select("*")
          .eq("user_id", userId)
          .single();

        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [userId]);

  return { isAdmin, loading };
}

