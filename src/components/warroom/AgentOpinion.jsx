import React from "react";
import { motion } from "framer-motion";
import { Flame, Target, Shield, Footprints, BatteryLow, HeartPulse, Binoculars, BrainCircuit } from "lucide-react";

const agentIcons = {
  "Pitching AI": Flame,
  "Hitting AI": Target,
  "Defense AI": Shield,
  "Baserunning AI": Footprints,
  "Fatigue AI": BatteryLow,
  "Injury-Risk AI": HeartPulse,
  "Scouting AI": Binoculars,
  "Game Theory AI": BrainCircuit,
};

const stanceStyle = {
  for: "border-emerald-400/25 text-emerald-300",
  against: "border-red-400/25 text-red-300",
  neutral: "border-slate-500/25 text-slate-300",
};

export default function AgentOpinion({ agent, index }) {
  const Icon = agentIcons[agent.agent] || BrainCircuit;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-xl border border-white/5 bg-[#0C1220] p-4"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-white">{agent.agent}</p>
        <span className={`ml-auto text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${stanceStyle[agent.stance] || stanceStyle.neutral}`}>
          {agent.stance}
        </span>
      </div>
      <p className="text-[13px] text-slate-400 leading-relaxed">{agent.opinion}</p>
    </motion.div>
  );
}