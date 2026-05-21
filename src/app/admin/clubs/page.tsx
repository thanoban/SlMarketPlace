"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import VerifiedBadge from "@/components/VerifiedBadge";

interface ClubItem {
  _id: string;
  name: string;
  description: string;
  contact: string;
  district: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/clubs")
      .then((r) => r.json())
      .then((d) => {
        setClubs(d.clubs || []);
        setLoading(false);
      });
  }, []);

  async function toggleVerify(id: string, current: boolean) {
    setActionLoading(id);
    await fetch(`/api/admin/clubs/${id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !current }),
    });
    setClubs((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isVerified: !current } : c))
    );
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Clubs ({clubs.length})</h1>
      <div className="space-y-3">
        {clubs.map((club) => (
          <div key={club._id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{club.name}</h3>
                  {club.isVerified && <VerifiedBadge />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{club.district} · {club.contact}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{club.description}</p>
              </div>
              <Button
                size="sm"
                variant={club.isVerified ? "secondary" : "primary"}
                loading={actionLoading === club._id}
                onClick={() => toggleVerify(club._id, club.isVerified)}
                className="flex-shrink-0 flex items-center gap-1"
              >
                {club.isVerified ? (
                  <><XCircle className="h-4 w-4" /> Unverify</>
                ) : (
                  <><CheckCircle className="h-4 w-4" /> Verify</>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
