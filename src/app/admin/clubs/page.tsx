"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, GraduationCap, Users, Briefcase } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { ClubType } from "@/models/Club";

interface ClubItem {
  _id: string;
  name: string;
  description: string;
  contact: string;
  district: string;
  clubType: ClubType;
  universityName?: string;
  isVerified: boolean;
  createdAt: string;
}

const clubTypeConfig: Record<ClubType, { label: string; icon: React.ElementType; badge: "blue" | "green" | "purple" }> = {
  university: { label: "University", icon: GraduationCap, badge: "blue" },
  community: { label: "Community", icon: Users, badge: "green" },
  private: { label: "Private", icon: Briefcase, badge: "purple" },
};

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unverified" | ClubType>("all");

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

  const filtered = clubs.filter((c) => {
    if (filter === "all") return true;
    if (filter === "unverified") return !c.isVerified;
    return c.clubType === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const unverifiedCount = clubs.filter((c) => !c.isVerified).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Clubs & Communities ({clubs.length})</h1>
        {unverifiedCount > 0 && (
          <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-1 rounded-full">
            {unverifiedCount} awaiting verification
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {[
          { value: "all", label: "All" },
          { value: "unverified", label: "Unverified" },
          { value: "university", label: "University" },
          { value: "community", label: "Community" },
          { value: "private", label: "Private" },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((club) => {
          const typeConf = club.clubType ? clubTypeConfig[club.clubType] : clubTypeConfig.community;
          const TypeIcon = typeConf.icon;

          return (
            <div key={club._id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{club.name}</h3>
                    {club.isVerified && <VerifiedBadge />}
                    <Badge variant={typeConf.badge} className="flex items-center gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {typeConf.label}
                    </Badge>
                  </div>

                  {club.universityName && (
                    <p className="text-xs text-blue-600 mt-0.5">{club.universityName}</p>
                  )}

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
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No clubs match this filter</div>
        )}
      </div>
    </div>
  );
}
