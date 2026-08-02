import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";

export default function ImportPreview({ rows, onConfirm, onCancel, saving }) {
  return (
    <div className="rounded-2xl border border-cyan-400/25 bg-[#0C1220] overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
        <p className="text-sm text-white font-semibold">{rows.length} rep{rows.length === 1 ? "" : "s"} found</p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5 mr-1.5" /> Discard
          </Button>
          <Button size="sm" onClick={onConfirm} disabled={saving} className="bg-cyan-400 hover:bg-cyan-300 text-[#04121A] font-semibold">
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
            Import into Rep Lab
          </Button>
        </div>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-white/[0.03] text-slate-500 sticky top-0">
            <tr>
              {["Athlete", "Type", "Pitch", "Velo", "Spin", "Exit velo", "Launch"].map((h) => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/5 text-slate-300">
                <td className="px-4 py-2.5 whitespace-nowrap">{r.player_name || "—"}</td>
                <td className="px-4 py-2.5">{r.rep_type}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{r.pitch_type || "—"}</td>
                <td className="px-4 py-2.5">{r.metrics?.velocity || "—"}</td>
                <td className="px-4 py-2.5">{r.metrics?.spin_rate || "—"}</td>
                <td className="px-4 py-2.5">{r.metrics?.exit_velocity || "—"}</td>
                <td className="px-4 py-2.5">{r.metrics?.launch_angle || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}