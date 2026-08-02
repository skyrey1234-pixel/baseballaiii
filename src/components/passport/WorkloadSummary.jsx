import React from "react";
import { AlertTriangle, ShieldCheck, Building2 } from "lucide-react";

const Stat = ({ label, value, tone }) => (
  <div className={`rounded-xl border p-4 ${tone}`}>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">{label}</p>
  </div>
);

export default function WorkloadSummary({ passport }) {
  const cleared = passport.cleared;
  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-6 ${cleared ? "border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5" : "border-rose-400/40 bg-gradient-to-br from-rose-500/15 to-amber-500/5"}`}>
        <div className="flex items-center gap-3">
          {cleared ? <ShieldCheck className="w-6 h-6 text-emerald-300" /> : <AlertTriangle className="w-6 h-6 text-rose-300" />}
          <div>
            <p className={`text-xl font-bold ${cleared ? "text-emerald-200" : "text-rose-200"}`}>
              {cleared ? "Cleared to pitch" : `Rest until ${passport.clearedOn}`}
            </p>
            <p className="text-sm text-slate-300 mt-0.5">
              Last outing: {passport.last.pitches} pitches on {passport.last.date}
              {passport.last.organization ? ` for ${passport.last.organization}` : ""} · {passport.restNeeded} day{passport.restNeeded === 1 ? "" : "s"} rest required, {passport.restTaken} taken.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Last 7 days" value={passport.last7} tone="border-cyan-400/25 bg-cyan-400/[0.07]" />
        <Stat label="Last 30 days" value={passport.last30} tone="border-violet-400/25 bg-violet-400/[0.07]" />
        <Stat label="Season total" value={passport.season} tone="border-amber-400/25 bg-amber-400/[0.07]" />
        <Stat label="Daily limit" value={passport.dailyLimit} tone="border-emerald-400/25 bg-emerald-400/[0.07]" />
      </div>

      {passport.orgs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-slate-500">Programs sharing this arm:</span>
          {passport.orgs.map((o) => <span key={o} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">{o}</span>)}
        </div>
      )}

      {passport.alerts.length > 0 && (
        <div className="space-y-2">
          {passport.alerts.map((a, i) => (
            <div key={i} className={`rounded-xl border px-4 py-3 text-sm flex gap-2.5 ${a.level === "high" ? "border-rose-400/30 bg-rose-500/10 text-rose-100" : "border-amber-400/30 bg-amber-400/10 text-amber-100"}`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-500">
        Based on MLB Pitch Smart guidance. This is decision support for coaches and parents — not medical advice.
      </p>
    </div>
  );
}