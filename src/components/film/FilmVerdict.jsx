import React from "react";
import AgentOpinion from "@/components/warroom/AgentOpinion";
import WarRoomVerdict from "@/components/warroom/WarRoomVerdict";

export default function FilmVerdict({ result }) {
  return (
    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400">War Room evaluation of this film</p>
      <div className="space-y-2">
        {(result.agents || []).map((a, i) => <AgentOpinion key={a.agent + i} agent={a} index={i} />)}
      </div>
      <WarRoomVerdict result={result} />
    </div>
  );
}