import React from "react";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle } from "lucide-react";

const Spec = ({ label, value }) => (
  <div className="rounded-lg bg-[#0A0F18] border border-white/5 px-3.5 py-2.5">
    <p className="text-[10px] uppercase tracking-widest text-slate-600">{label}</p>
    <p className="text-sm text-slate-200 mt-0.5">{value || "—"}</p>
  </div>
);

export default function DesignCard({ design, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-400/20 bg-[#0C1220] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400">{design.pitcher_name}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1">{design.pitch_name}</h3>
          <p className="text-xs text-slate-500 mt-1.5">{design.goal}</p>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(design)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0" aria-label="Delete design">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5 mt-5">
        <Spec label="Target velocity" value={design.target_velocity} />
        <Spec label="Target spin" value={design.target_spin} />
        <Spec label="Spin direction" value={design.spin_direction} />
        <Spec label="Release cue" value={design.release_cue} />
      </div>

      <div className="mt-5 space-y-4 text-sm">
        <div><p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Grip</p><p className="text-slate-300">{design.grip}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Movement profile</p><p className="text-slate-300">{design.movement_profile}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Tunneling</p><p className="text-slate-300">{design.tunneling}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Where it plays</p><p className="text-slate-300">{design.usage}</p></div>
      </div>

      {design.progression?.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Practice progression</p>
          <ol className="space-y-1.5">
            {design.progression.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="text-emerald-400 font-mono text-xs pt-0.5">{String(i + 1).padStart(2, "0")}</span>{s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {design.success_metrics?.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Success measurements</p>
          <div className="flex flex-wrap gap-2">
            {design.success_metrics.map((m, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">{m}</span>
            ))}
          </div>
        </div>
      )}

      {design.risk_notes && (
        <div className="mt-5 flex gap-3 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90">{design.risk_notes}</p>
        </div>
      )}
    </motion.div>
  );
}