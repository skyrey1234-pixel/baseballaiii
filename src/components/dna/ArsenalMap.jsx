import React from "react";
import { motion } from "framer-motion";
import { Link2, Copy, CircleDashed } from "lucide-react";

const tunnelColor = (q) => (q >= 75 ? "bg-emerald-400" : q >= 50 ? "bg-sky-400" : "bg-amber-400");

const ListBlock = ({ icon: Icon, title, items }) =>
  items?.length ? (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
        <p className="text-[10px] uppercase tracking-widest text-slate-600">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((t, i) => <li key={i} className="text-sm text-slate-300 pl-5 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-400/60">{t}</li>)}
      </ul>
    </div>
  ) : null;

export default function ArsenalMap({ dna }) {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-[#0A0F18] p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400 mb-2">Arsenal relationship map</p>
        <p className="text-sm text-slate-300">{dna.summary}</p>
      </div>

      {dna.tunnel_pairs?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-slate-600" />
            <p className="text-[10px] uppercase tracking-widest text-slate-600">Tunnel pairs</p>
          </div>
          {dna.tunnel_pairs.map((p, i) => (
            <div key={i} className="rounded-xl bg-[#0C1220] border border-white/5 px-4 py-3">
              <div className="flex justify-between items-center gap-3">
                <p className="text-sm text-slate-200">{p.pair}</p>
                <span className="text-xs font-mono text-slate-400 shrink-0">{p.tunnel_quality}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden my-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.tunnel_quality}%` }} transition={{ duration: 0.7, delay: i * 0.05 }}
                  className={`h-full rounded-full ${tunnelColor(p.tunnel_quality)}`} />
              </div>
              <p className="text-xs text-slate-500">{p.note}</p>
            </div>
          ))}
        </div>
      )}

      <ListBlock icon={Copy} title="Redundant shapes" items={dna.redundancies} />
      <ListBlock icon={CircleDashed} title="What the arsenal is missing" items={dna.arsenal_gaps} />
    </div>
  );
}