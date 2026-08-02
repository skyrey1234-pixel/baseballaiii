import React from "react";
import { motion } from "framer-motion";
import { Film, Music, Quote } from "lucide-react";

export default function ChapterCard({ chapter, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      className="rounded-2xl border border-indigo-400/25 bg-gradient-to-br from-[#1C1840] via-[#161B36] to-[#101828] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-300 to-fuchsia-300 text-[#150C2A] font-bold flex items-center justify-center text-sm">{index + 1}</span>
        <div>
          <h3 className="text-lg font-bold text-white">{chapter.title}</h3>
          <p className="text-xs text-indigo-300">{chapter.beat}</p>
        </div>
      </div>

      {chapter.narration && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex gap-3">
          <Quote className="w-4 h-4 text-fuchsia-300 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-200 italic leading-relaxed">{chapter.narration}</p>
        </div>
      )}

      {chapter.footage?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Film className="w-3.5 h-3.5 text-cyan-300" />
            <p className="text-[10px] uppercase tracking-widest text-cyan-300">Shot list</p>
          </div>
          <ul className="space-y-1.5">
            {chapter.footage.map((f, i) => (
              <li key={i} className="text-sm text-slate-300 pl-4 border-l border-cyan-400/30">{f}</li>
            ))}
          </ul>
        </div>
      )}

      {chapter.music && (
        <p className="text-xs text-slate-400 flex items-center gap-2"><Music className="w-3.5 h-3.5 text-violet-300" /> {chapter.music}</p>
      )}
    </motion.div>
  );
}