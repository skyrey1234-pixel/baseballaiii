import React from "react";
import { motion } from "framer-motion";
import { Gavel } from "lucide-react";

export default function WarRoomVerdict({ result }) {
  const best = Math.max(...(result.options || []).map((o) => o.win_probability || 0), 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/[0.08] to-transparent p-6 md:p-8"
    >
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-emerald-400 mb-3">
        <Gavel className="w-4 h-4" /> Final recommendation · confidence {result.confidence}
      </p>
      <p className="text-xl md:text-2xl font-bold text-white leading-snug">{result.recommendation}</p>
      <p className="text-sm text-slate-400 mt-3 leading-relaxed">{result.reasoning}</p>
      {result.options?.length > 0 && (
        <div className="mt-6 space-y-2">
          {result.options.map((o) => (
            <div key={o.decision} className="flex items-center gap-4">
              <p className={`w-40 md:w-56 shrink-0 text-xs ${o.win_probability === best ? "text-emerald-300 font-semibold" : "text-slate-500"}`}>{o.decision}</p>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${o.win_probability === best ? "bg-emerald-400" : "bg-slate-600"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${o.win_probability}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className={`w-10 text-right text-sm tabular-nums ${o.win_probability === best ? "text-emerald-300 font-bold" : "text-slate-400"}`}>{o.win_probability}%</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}