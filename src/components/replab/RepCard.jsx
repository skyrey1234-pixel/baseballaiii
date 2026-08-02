import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Baby, Wrench, Target } from "lucide-react";
import EvidenceDemo from "@/components/evidence/EvidenceDemo";

const SOURCE_LABELS = {
  radar_measured: "Radar measured",
  camera_measured: "Camera measured",
  sensor_imported: "Sensor imported",
  ai_estimated: "AI estimated",
  coach_entered: "Coach entered",
  player_reported: "Player reported",
};

const CONF = {
  high: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  moderate: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  experimental: "text-amber-300 border-amber-400/30 bg-amber-400/10",
};

const gradeColor = (g) => (g >= 80 ? "text-emerald-400" : g >= 55 ? "text-sky-400" : "text-amber-400");

export default function RepCard({ rep, onDelete }) {
  const [simple, setSimple] = useState(false);
  const metrics = Object.entries(rep.metrics || {}).filter(([, v]) => v);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/5 bg-[#0C1220] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400">{rep.player_name} · {rep.pitch_type || rep.rep_type}</p>
          <p className="text-sm text-white mt-1.5"><span className="text-slate-500">Intent:</span> {rep.intent}</p>
          {rep.actual_result && <p className="text-sm text-slate-400 mt-0.5"><span className="text-slate-500">Result:</span> {rep.actual_result}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className={`text-3xl font-bold tracking-tight ${gradeColor(rep.execution_grade)}`}>{rep.execution_grade}<span className="text-sm text-slate-600">/100</span></p>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">Execution</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-slate-400">{SOURCE_LABELS[rep.data_source] || rep.data_source}</span>
        <span className={`text-[10px] px-2.5 py-1 rounded-full border ${CONF[rep.confidence] || CONF.moderate}`}>{rep.confidence} confidence</span>
        {onDelete && (
          <button onClick={() => onDelete(rep)} className="ml-auto text-slate-600 hover:text-red-400 transition-colors" aria-label="Delete rep">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {metrics.map(([k, v]) => (
            <div key={k} className="rounded-lg bg-[#0A0F18] border border-white/5 px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest text-slate-600">{k.replace(/_/g, " ")}</p>
              <p className="text-sm text-slate-200 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-4 text-sm">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-600">What happened</p>
            <button onClick={() => setSimple(!simple)} className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300">
              <Baby className="w-3 h-3" /> {simple ? "Coach version" : "Explain like I'm 14"}
            </button>
          </div>
          <p className="text-slate-300">{simple ? rep.simple_explanation : rep.plain_explanation}</p>
        </div>

        {rep.likely_cause && (
          <div><p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Likely cause</p><p className="text-slate-300">{rep.likely_cause}</p></div>
        )}
        {rep.grade_reason && (
          <div><p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Why this grade</p><p className="text-slate-300">{rep.grade_reason}</p></div>
        )}
      </div>

      {rep.prescribed_drill && (
        <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4 space-y-2.5">
          <div className="flex gap-3">
            <Wrench className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-200">{rep.prescribed_drill}</p>
          </div>
          {rep.drill_success_check && (
            <div className="flex gap-3">
              <Target className="w-4 h-4 text-emerald-400/70 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">Next session tests it: {rep.drill_success_check}</p>
            </div>
          )}
        </div>
      )}

      <EvidenceDemo
        entityName="PitchRep"
        record={rep}
        subject={`${rep.player_name} throwing a ${rep.pitch_type || rep.rep_type}, intent: ${rep.intent}`}
        fix={rep.prescribed_drill || rep.likely_cause}
      />
    </motion.div>
  );
}