import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertTriangle, Minus } from "lucide-react";

const STYLE = {
  good: { icon: Check, ring: "border-emerald-400/40 bg-emerald-400/10", text: "text-emerald-300" },
  flaw: { icon: AlertTriangle, ring: "border-amber-400/40 bg-amber-400/10", text: "text-amber-300" },
  neutral: { icon: Minus, ring: "border-sky-400/40 bg-sky-400/10", text: "text-sky-300" },
};

export default function SwingCallout({ phase }) {
  const s = STYLE[phase?.verdict] || STYLE.neutral;
  const Icon = s.icon;

  return (
    <div className="absolute left-4 right-4 bottom-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {phase && (
          <motion.div key={phase.name}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className={`rounded-xl border backdrop-blur-md px-4 py-3 max-w-lg ${s.ring}`}>
            <div className="flex items-center gap-2">
              <Icon className={`w-3.5 h-3.5 ${s.text}`} />
              <p className={`text-[10px] uppercase tracking-[0.25em] ${s.text}`}>{phase.name}</p>
            </div>
            <p className="text-sm text-white mt-1.5">{phase.what_happened}</p>
            {phase.cue && <p className="text-xs text-slate-300 mt-1.5">→ {phase.cue}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}