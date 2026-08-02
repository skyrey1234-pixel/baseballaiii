import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Target, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import EvidenceDemo from "@/components/evidence/EvidenceDemo";

export default function ChainCard({ pattern }) {
  return (
    <div className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-[#1A1436] via-[#141B34] to-[#101A2E] p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300">{pattern.player_name} · {pattern.player_role}</p>
          <h3 className="text-xl font-bold text-white mt-1.5">{pattern.pattern_name}</h3>
          <p className="text-sm text-slate-400 mt-1">Trigger: {pattern.trigger}</p>
        </div>
        <div className="flex gap-2">
          {pattern.frequency && <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-200">{pattern.frequency}</span>}
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{pattern.confidence} confidence</span>
        </div>
      </div>

      <div className="space-y-0">
        {(pattern.chain || []).map((link, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <div className={`rounded-xl border px-4 py-3 ${link.is_root_cause ? "border-rose-400/50 bg-rose-500/10" : "border-white/10 bg-white/[0.03]"}`}>
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${link.is_root_cause ? "bg-rose-400 text-[#1A0A14]" : "bg-cyan-400/20 text-cyan-200"}`}>{i + 1}</span>
                <p className="text-sm font-semibold text-white">{link.step}</p>
                {link.is_root_cause && <span className="ml-auto text-[9px] uppercase tracking-widest text-rose-300">Root cause</span>}
              </div>
              {link.detail && <p className="text-xs text-slate-400 mt-1.5 pl-7">{link.detail}</p>}
            </div>
            {i < (pattern.chain || []).length - 1 && (
              <div className="flex justify-center py-1"><ArrowDown className="w-3.5 h-3.5 text-fuchsia-400/60" /></div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {[
          [Target, "Break this link", pattern.root_cause, "border-rose-400/25 bg-rose-500/[0.07] text-rose-100"],
          [RefreshCw, "Why it repeats", pattern.why_it_repeats, "border-amber-400/25 bg-amber-400/[0.06] text-amber-100"],
          [ShieldCheck, "Intervention", pattern.intervention, "border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-100"],
          [CheckCircle2, "Verify the fix", pattern.verification, "border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-100"],
        ].filter(([, , v]) => v).map(([Icon, label, value, cls]) => (
          <div key={label} className={`rounded-xl border p-4 ${cls}`}>
            <div className="flex items-center gap-2 mb-1.5 opacity-80">
              <Icon className="w-3.5 h-3.5" />
              <p className="text-[10px] uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-sm">{value}</p>
          </div>
        ))}
      </div>

      <EvidenceDemo
        entityName="MistakePattern"
        record={pattern}
        subject={`${pattern.player_name}, a ${pattern.player_role}, in this situation: ${pattern.trigger}`}
        fix={pattern.intervention || pattern.root_cause}
      />
    </div>
  );
}