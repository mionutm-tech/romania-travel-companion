"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useSavedItems(itemType: "poi" | "itinerary") {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    const table =
      itemType === "poi" ? "user_saved_pois" : "user_saved_itineraries";
    const idColumn = itemType === "poi" ? "poi_id" : "itinerary_id";

    supabase
      .from(table)
      .select(idColumn)
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          setSavedIds(
            new Set(data.map((row: Record<string, string>) => row[idColumn]))
          );
        }
      });
  }, [user, itemType, supabase]);

  const toggleSave = useCallback(
    async (itemId: string) => {
      if (!user) return false;

      setLoading(true);
      const table =
        itemType === "poi" ? "user_saved_pois" : "user_saved_itineraries";
      const idColumn = itemType === "poi" ? "poi_id" : "itinerary_id";
      const isSaved = savedIds.has(itemId);

      if (isSaved) {
        await supabase
          .from(table)
          .delete()
          .eq("user_id", user.id)
          .eq(idColumn, itemId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      } else {
        await supabase
          .from(table)
          .insert({ user_id: user.id, [idColumn]: itemId });
        setSavedIds((prev) => new Set(prev).add(itemId));
      }

      setLoading(false);
      return !isSaved;
    },
    [user, itemType, savedIds, supabase]
  );

  return { savedIds, toggleSave, loading, isAuthenticated: !!user };
}
