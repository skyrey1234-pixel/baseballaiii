import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Swords, Crosshair, ArrowRight } from "lucide-react";
import GameSituation from "@/components/dashboard/GameSituation";
import ReadinessCard from "@/components/players/ReadinessCard";

export default function Dashboard() {
  const { data: games, isLoading: loadingGame } = useQuery({
    queryKey: ["liveGame"],
    queryFn: () => base44.entities.Game.filter({ status: "live" }, "-created_date", 1),
  });
  const { data: players, isLoading: loadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: () => base44.entities.Player.list("readiness", 50),
  });

  const game = games?.[0];
  const watchlist = (players || []).filter((p) => (p.readiness ?? 100) < 80).slice(0, 3);

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Command Center</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">See the next play before it happens.</h1>
      </header>

      {loadingGame ? (
        <div className="rounded-2xl border border-white/5 bg-[#0C1220] h-52 animate-pulse" />
      ) : game ? (
        <GameSituation game={game} />
      ) : (
        <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-8 text-center text-slate-500 text-sm">No live game in progress.</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/war-room" className="group rounded-2xl border border-white/5 bg-[#0C1220] p-6 hover:border-emerald-400/30 transition-colors duration-300">
          <Swords className="w-6 h-6 text-emerald-400 mb-3" />
          <p className="text-white font-semibold flex items-center gap-2">Open the War Room <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></p>
          <p className="text-sm text-slate-500 mt-1">Let eight AI coaches debate your next decision.</p>
        </Link>
        <Link to="/pitch-predictor" className="group rounded-2xl border border-white/5 bg-[#0C1220] p-6 hover:border-emerald-400/30 transition-colors duration-300">
          <Crosshair className="w-6 h-6 text-emerald-400 mb-3" />
          <p className="text-white font-semibold flex items-center gap-2">Predict the next pitch <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></p>
          <p className="text-sm text-slate-500 mt-1">Pitch type, location, and chase probability before it happens.</p>
        </Link>
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Readiness watchlist</h2>
          <Link to="/players" className="text-xs text-emerald-400 hover:text-emerald-300">Full roster →</Link>
        </div>
        {loadingPlayers ? (
          <div className="grid md:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <div key={i} className="rounded-2xl bg-[#0C1220] h-56 animate-pulse" />)}</div>
        ) : watchlist.length ? (
          <div className="grid md:grid-cols-3 gap-4">
            {watchlist.map((p) => <ReadinessCard key={p.id} player={p} />)}
          </div>
        ) : (
          <p className="text-sm text-slate-500">All players are at full readiness.</p>
        )}
      </section>
    </div>
  );
}