import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const badge = {
  low: "text-emerald-400 bg-emerald-400/10",
  stable: "text-emerald-400 bg-emerald-400/10",
  moderate: "text-amber-400 bg-amber-400/10",
  low_moderate: "text-amber-400 bg-amber-400/10",
  declining: "text-amber-400 bg-amber-400/10",
  elevated: "text-amber-400 bg-amber-400/10",
  high: "text-red-400 bg-red-400/10",
  critical: "text-red-400 bg-red-400/10",
};

const label = (v) => (v || "").replace("_", "–");

export default function ReadinessCard({ player }) {
  const r = player.readiness ?? 0;
  const color = r >= 80 ? "#34D399" : r >= 60 ? "#FBBF24" : "#F87171";
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-5 hover:border-emerald-400/20 transition-colors duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white font-semibold">{player.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">#{player.number} · {player.position} · {player.key_stat}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums" style={{ color }}>{r}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Readiness</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${r}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {[
          ["Fatigue", player.muscular_fatigue],
          ["Mechanics", player.mechanical_stability],
          ["Command risk", player.command_risk],
          ["Injury warning", player.injury_warning],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5">
            <span className="text-slate-500">{k}</span>
            <span className={`px-1.5 py-0.5 rounded font-medium capitalize ${badge[v] || "text-slate-400 bg-white/5"}`}>{label(v)}</span>
          </div>
        ))}
      </div>
      {player.drift_notes?.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {player.drift_notes.map((n, i) => (
            <p key={i} className="flex gap-2 text-xs text-amber-300/90 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{n}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}