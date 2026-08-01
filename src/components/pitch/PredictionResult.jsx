import React from "react";
import { motion } from "framer-motion";
import { AlertOctagon, Lightbulb } from "lucide-react";

function ProbBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-500">{label}</span>
        <span className="text-white font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function PredictionResult({ result }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.07] to-transparent p-6">
        <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400 mb-2">Predicted Pitch</p>
        <p className="text-2xl md:text-3xl font-bold text-white">{result.predicted_pitch}</p>
        <p className="text-sm text-slate-400 mt-1">{result.predicted_location} · {result.pitch_probability}% likely</p>
      </div>
      <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-6 space-y-4">
        <ProbBar label="Strike probability" value={result.strike_probability} />
        <ProbBar label="Batter swing probability" value={result.swing_probability} />
        <ProbBar label="Batter chase probability" value={result.chase_probability} />
        <ProbBar label="Contact probability" value={result.contact_probability} />
      </div>
      <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-5">
        <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-400 mb-2">
          <AlertOctagon className="w-4 h-4" /> Most dangerous mistake
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">{result.dangerous_mistake}</p>
      </div>
      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
        <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 mb-2">
          <Lightbulb className="w-4 h-4" /> Recommended alternative
        </p>
        <p className="text-sm text-white font-medium">{result.recommended_alternative}</p>
        <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{result.reason}</p>
      </div>
    </motion.div>
  );
}