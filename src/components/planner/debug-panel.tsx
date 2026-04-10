"use client";

import { useState } from "react";
import type { PlannerResult } from "@/types/database";

export function DebugPanel({ result }: { result: PlannerResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-xl border border-border/40 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-4 text-sm font-medium text-forest hover:bg-muted/30"
      >
        {open ? "▾" : "▸"} Debug — score breakdown ({result.stops.length} stops,{" "}
        {result.debug.candidates_after_filter}/
        {result.debug.candidates_considered} candidates passed)
      </button>
      {open && (
        <div className="border-t border-border/40 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Stops
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="p-1">Day</th>
                  <th className="p-1">Stop</th>
                  <th className="p-1">POI</th>
                  <th className="p-1">Total</th>
                  <th className="p-1">Reasons</th>
                </tr>
              </thead>
              <tbody>
                {result.stops.map((s) => (
                  <tr
                    key={`${s.day_number}-${s.stop_order}`}
                    className="border-t border-border/20"
                  >
                    <td className="p-1">{s.day_number}</td>
                    <td className="p-1">{s.stop_order}</td>
                    <td className="p-1">{s.poi.name}</td>
                    <td className="p-1 font-mono">{s.score.total}</td>
                    <td className="p-1 text-muted-foreground">
                      {s.score.reasons.join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.debug.rejected_for_constraint.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Rejected ({result.debug.rejected_for_constraint.length})
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {result.debug.rejected_for_constraint.slice(0, 20).map((r) => (
                  <li key={r.poi_id}>
                    <span className="font-mono">{r.poi_id.slice(0, 8)}</span>{" "}
                    — {r.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
