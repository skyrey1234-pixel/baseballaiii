import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";

const LEVEL = {
  high: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  moderate: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  low: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  experimental: "text-amber-300 border-amber-400/30 bg-amber-400/10",
};

const Meter = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-mono">{value}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.7 }}
        className="h-full rounded-full bg-emerald-400" />
    </div>
  </div>
);

export default function DNACard({ pitch, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      className="rounded-2xl border border-white/5 bg-[#0C1220] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{pitch.pitch_type} DNA</h3>
          <p className="text-sm text-slate-400 mt-1">{pitch.identity}</p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 ${LEVEL[pitch.confidence] || LEVEL.moderate}`}>
          {pitch.confidence} confidence
        </span>
      </div>

      <div className="space-y-3 mt-5">
        <Meter label="Shape consistency" value={pitch.shape_consistency} />
        <Meter label="Fastball tunnel match" value={pitch.fastball_tunnel_match} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-4">
        <div className="rounded-lg bg-[#0A0F18] border border-white/5 px-3.5 py-2.5">
          <p className="text-[9px] uppercase tracking-widest text-slate-600">Chase potential</p>
          <p className={`text-sm mt-0.5 capitalize ${pitch.chase_potential === "high" ? "text-emerald-400" : "text-slate-200"}`}>{pitch.chase_potential}</p>
        </div>
        <div className="rounded-lg bg-[#0A0F18] border border-white/5 px-3.5 py-2.5">
          <p className="text-[9px] uppercase tracking-widest text-slate-600">Strike reliability</p>
          <p className={`text-sm mt-0.5 capitalize ${pitch.strike_reliability === "low" ? "text-amber-400" : "text-slate-200"}`}>{pitch.strike_reliability}</p>
        </div>
      </div>

      {pitch.mistake_danger && (
        <div className="mt-4 flex gap-3 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90">{pitch.mistake_danger}</p>
        </div>
      )}

      {pitch.trend && (
        <div className="mt-3 flex gap-3 px-1">
          <TrendingUp className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">{pitch.trend}</p>
        </div>
      )}
    </motion.div>
  );
}