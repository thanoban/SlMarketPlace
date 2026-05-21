"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SaveButton({
  eventId,
  initialSaved,
}: {
  eventId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const method = saved ? "DELETE" : "POST";
    await fetch(`/api/saved/${eventId}`, { method });
    setSaved(!saved);
    setLoading(false);
  }

  return (
    <Button
      variant={saved ? "primary" : "secondary"}
      size="lg"
      className="w-full"
      loading={loading}
      onClick={toggle}
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-2" /> Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" /> Save event
        </>
      )}
    </Button>
  );
}
