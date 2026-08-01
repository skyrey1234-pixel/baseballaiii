import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ReadinessCard from "@/components/players/ReadinessCard";

export default function Players() {
  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: () => base44.entities.Player.list("readiness", 100),
  });

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Roster Intel</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Live readiness & mechanical drift</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Decision-support signals, not medical diagnoses. Scores combine fatigue markers, mechanical stability, and command trends.
        </p>
      </header>
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-[#0C1220] h-56 animate-pulse" />)}
        </div>
      ) : players?.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => <ReadinessCard key={p.id} player={p} />)}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No players on the roster yet.</p>
      )}
    </div>
  );
}