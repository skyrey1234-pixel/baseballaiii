import React, { useState } from "react";
import { ChevronDown, Trash2, Video, AlertTriangle, MapPin, Calendar, Radar, Eye } from "lucide-react";
import { scoreClaim, deviceLabel, TIER_STYLE } from "@/lib/evidence";

export default function ClaimCard({ claim, onDelete }) {
  const [open, setOpen] = useState(false);
  const { score, tier, gaps } = scoreClaim(claim);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#141F3C] to-[#111829] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-6 py-5 flex items-center gap-4 hover:bg-white/[0.03] transition-colors">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{claim.metric}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{claim.peak_value}</p>
        </div>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border ${TIER_STYLE[tier]}`}>{tier} · {score}</span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-4">
          <div className="grid sm:grid-cols-2 gap-2.5 text-sm">
            {[
              [Calendar, "Date", claim.date],
              [MapPin, "Location", claim.location],
              [Radar, "Device", deviceLabel(claim.device)],
              [Eye, "Setting", claim.setting],
              [Radar, "Session average", claim.average_value],
              [Eye, "Measurements", claim.sample_size || null],
              [Eye, "Witness", claim.witness],
            ].filter(([, , v]) => v).map(([Icon, label, value]) => (
              <div key={label} className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
                <Icon className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="text-[11px] uppercase tracking-widest text-slate-500">{label}</span>
                <span className="ml-auto text-slate-100">{value}</span>
              </div>
            ))}
          </div>

          {claim.video_url ? (
            <a href={claim.video_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3">
              <Video className="w-4 h-4" /> Watch the measured rep
            </a>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-400 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <Video className="w-4 h-4" /> No footage attached to this number
            </div>
          )}

          {gaps.length > 0 && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <p className="text-[10px] uppercase tracking-widest text-amber-300">What a scout would question</p>
              </div>
              <ul className="space-y-1">
                {gaps.map((g) => <li key={g} className="text-sm text-amber-100">• {g}</li>)}
              </ul>
            </div>
          )}

          {claim.notes && <p className="text-sm text-slate-400">{claim.notes}</p>}

          <button onClick={() => onDelete(claim)} className="text-slate-600 hover:text-rose-400 transition-colors" aria-label="Delete claim">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}