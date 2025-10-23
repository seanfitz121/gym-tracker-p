"use client";

import { useState, useEffect } from "react";
import type { AnnouncementWithProfile } from "@/lib/types/announcement";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithProfile[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/announcement");

      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await response.json();
      setAnnouncements(data.announcements || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const refresh = () => {
    fetchAnnouncements();
  };

  return { announcements, loading, error, refresh };
}

export function useCreateAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAnnouncement = async (
    message: string,
  ): Promise<AnnouncementWithProfile | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create announcement");
      }

      const data = await response.json();
      return data.announcement;
    } catch (err) {
      setError(err as Error);
      console.error("Error creating announcement:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createAnnouncement, loading, error };
}

export function useDeleteAnnouncement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/announcement/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete announcement");
      }

      return true;
    } catch (err) {
      setError(err as Error);
      console.error("Error deleting announcement:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAnnouncement, loading, error };
}

