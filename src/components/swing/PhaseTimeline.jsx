import React from "react";
import { Check, AlertTriangle, Minus } from "lucide-react";

const ICON = { good: Check, flaw: AlertTriangle, neutral: Minus };
const COLOR = { good: "text-emerald-400 border-emerald-400/40", flaw: "text-amber-400 border-amber-400/40", neutral: "text-sky-400 border-sky-400/40" };

export default function PhaseTimeline({ phases, activeIndex, onSelect }) {
  return (
    <div className="space-y-2">
      {(phases || []).map((p, i) => {
        const Icon = ICON[p.verdict] || Minus;
        const active = i === activeIndex;
        return (
          <button key={p.name + i} onClick={() => onSelect(i)}
            className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${active ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-white/5 bg-[#0C1220] hover:border-white/15"}`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${COLOR[p.verdict] || COLOR.neutral}`}>
                <Icon className="w-3 h-3" />
              </span>
              <p className="text-sm text-white font-medium">{p.name}</p>
              <span className="ml-auto text-[10px] font-mono text-slate-600">{Math.round(p.timing_pct)}%</span>
            </div>
            {active && (
              <div className="mt-2.5 pl-9 space-y-1.5">
                <p className="text-xs text-slate-300">{p.what_happened}</p>
                {p.cue && <p className="text-xs text-emerald-300/90">→ {p.cue}</p>}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}