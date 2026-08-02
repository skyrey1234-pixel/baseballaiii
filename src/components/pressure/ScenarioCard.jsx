import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Loader2, Trash2, Volume2, Target, ClipboardCheck } from "lucide-react";

const GRADE_LABELS = {
  decision_quality: "Decision",
  execution: "Execution",
  emotional_control: "Composure",
  situational_awareness: "Awareness",
};

const tone = (v) => (v >= 80 ? "text-emerald-300" : v >= 55 ? "text-cyan-300" : "text-amber-300");

export default function ScenarioCard({ scenario: s, onGrade, onDelete, grading }) {
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-orange-400/25 bg-gradient-to-br from-[#2A1524] via-[#1B1730] to-[#121A2E] p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-orange-300">{s.player_name} · {s.focus}</p>
          <h3 className="text-xl font-bold text-white mt-1.5">{s.title}</h3>
        </div>
        <button onClick={() => onDelete(s)} className="text-slate-600 hover:text-rose-400 transition-colors shrink-0" aria-label="Delete scenario">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-rose-400/25 bg-rose-500/[0.08] p-4">
          <p className="text-[10px] uppercase tracking-widest text-rose-300 mb-1.5">Situation</p>
          <p className="text-sm text-rose-50">{s.situation}</p>
        </div>
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4">
          <div className="flex items-center gap-2 mb-1.5"><Volume2 className="w-3.5 h-3.5 text-amber-300" /><p className="text-[10px] uppercase tracking-widest text-amber-300">Stakes</p></div>
          <p className="text-sm text-amber-50">{s.stakes}</p>
        </div>
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4">
          <div className="flex items-center gap-2 mb-1.5"><Target className="w-3.5 h-3.5 text-emerald-300" /><p className="text-[10px] uppercase tracking-widest text-emerald-300">Objective</p></div>
          <p className="text-sm text-emerald-50">{s.objective}</p>
        </div>
        <div className="rounded-xl border border-violet-400/25 bg-violet-400/[0.07] p-4">
          <p className="text-[10px] uppercase tracking-widest text-violet-300 mb-1.5">Consequence</p>
          <p className="text-sm text-violet-50">{s.consequence}</p>
        </div>
      </div>

      {s.constraints?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {s.constraints.map((c, i) => (
            <span key={i} className="text-[11px] px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-slate-200">{c}</span>
          ))}
        </div>
      )}

      {s.coach_setup && (
        <p className="text-xs text-slate-400"><span className="text-slate-500 uppercase tracking-widest text-[10px]">Field setup · </span>{s.coach_setup}</p>
      )}

      {s.status === "graded" ? (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(GRADE_LABELS).map(([k, label]) => (
              <div key={k} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-center">
                <p className={`text-xl font-bold ${tone(s.grades?.[k] ?? 0)}`}>{s.grades?.[k] ?? "—"}</p>
                <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-300">{s.grade_notes}</p>
          {s.next_step && <p className="text-sm text-cyan-200">→ {s.next_step}</p>}
        </div>
      ) : open ? (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="What happened when the athlete ran it? Body language, decision, execution, result."
            className="bg-[#141C31] border-white/10 text-slate-100 placeholder:text-slate-500 resize-none" />
          <Button onClick={() => onGrade(s, notes)} disabled={grading || !notes.trim()}
            className="w-full h-10 font-semibold text-[#1A0B04] bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-200 hover:to-orange-200">
            {grading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Grading…</> : <><ClipboardCheck className="w-4 h-4 mr-2" /> Grade the rep</>}
          </Button>
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} variant="outline" className="w-full border-white/15 bg-white/[0.03] text-slate-200 hover:bg-white/10 hover:text-white">
          <Flame className="w-4 h-4 mr-2 text-orange-300" /> Log how it went
        </Button>
      )}
    </div>
  );
}