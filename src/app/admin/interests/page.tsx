"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Interest {
  _id: string;
  name: string;
}

export default function AdminInterestsPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/interests")
      .then((r) => r.json())
      .then((d) => {
        setInterests(d.interests || []);
        setLoading(false);
      });
  }, []);

  async function addInterest(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError("");

    const res = await fetch("/api/admin/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      setError(data.error || "Failed to add");
      return;
    }

    setInterests((prev) => [...prev, data.interest].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName("");
  }

  async function deleteInterest(id: string) {
    setDeleting(id);
    await fetch("/api/admin/interests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setInterests((prev) => prev.filter((i) => i._id !== id));
    setDeleting(null);
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
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="h-5 w-5 text-blue-600" />
        Interest Categories ({interests.length})
      </h1>

      {/* Add new */}
      <form onSubmit={addInterest} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-2">
        <Input
          placeholder="New interest category name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          error={error}
        />
        <Button type="submit" loading={adding} className="flex-shrink-0 flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {interests.map((i) => (
          <div key={i._id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">{i.name}</span>
            <button
              onClick={() => deleteInterest(i._id)}
              disabled={deleting === i._id}
              className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 p-1"
              aria-label="Delete interest"
            >
              {deleting === i._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
