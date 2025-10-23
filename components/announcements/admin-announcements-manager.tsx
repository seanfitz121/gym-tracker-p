"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from "@/lib/hooks/use-announcements";
import { Trash2, Send, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function AdminAnnouncementsManager() {
  const { announcements, loading, refresh } = useAnnouncements();
  const { createAnnouncement, loading: creating } = useCreateAnnouncement();
  const { deleteAnnouncement, loading: deleting } = useDeleteAnnouncement();
  const [message, setMessage] = useState("");

  const handlePost = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    const announcement = await createAnnouncement(message.trim());
    if (announcement) {
      toast.success("Announcement posted!");
      setMessage("");
      refresh();
    } else {
      toast.error("Failed to post announcement");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteAnnouncement(id);
    if (success) {
      toast.success("Announcement deleted");
      refresh();
    } else {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-blue-600" />
          <CardTitle>Admin Announcements</CardTitle>
        </div>
        <CardDescription>
          Post announcements that all users can see
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Post New Announcement */}
        <div className="space-y-3">
          <Textarea
            placeholder="Type your announcement here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handlePost}
            disabled={creating || !message.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Post Announcement
          </Button>
        </div>

        <Separator />

        {/* Previous Announcements */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Previous Announcements</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No announcements yet
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className="relative">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={announcement.profile?.avatar_url || undefined}
                            alt={announcement.profile?.display_name || "Admin"}
                          />
                          <AvatarFallback>
                            {(
                              announcement.profile?.display_name?.[0] || "A"
                            ).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold">
                              {announcement.profile?.display_name || "Admin"}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(announcement.id)}
                              disabled={deleting}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2">
                            {announcement.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(announcement.created_at),
                              { addSuffix: true },
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

