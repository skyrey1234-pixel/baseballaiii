import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Swords, Crosshair, ArrowRight, GitBranch, ShieldCheck } from "lucide-react";

const TILES = [
  { to: "/war-room", icon: Swords, title: "Open the War Room", desc: "Let eight AI coaches debate your next decision.", cls: "from-rose-500/20 to-orange-500/10 border-rose-400/25 hover:border-rose-300/50", icon_cls: "text-rose-300" },
  { to: "/pitch-predictor", icon: Crosshair, title: "Predict the next pitch", desc: "Pitch type, location, and chase probability before it happens.", cls: "from-sky-500/20 to-cyan-500/10 border-sky-400/25 hover:border-sky-300/50", icon_cls: "text-sky-300" },
  { to: "/mistake-dna", icon: GitBranch, title: "Trace a Mistake DNA chain", desc: "Find the root cause behind a repeating failure, not just the error.", cls: "from-fuchsia-500/20 to-violet-500/10 border-fuchsia-400/25 hover:border-fuchsia-300/50", icon_cls: "text-fuchsia-300" },
  { to: "/passport", icon: ShieldCheck, title: "Check a pitching passport", desc: "Every team's pitches in one workload record with rest tracking.", cls: "from-emerald-500/20 to-teal-500/10 border-emerald-400/25 hover:border-emerald-300/50", icon_cls: "text-emerald-300" },
];
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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-200 via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">See the next play before it happens.</h1>
      </header>

      {loadingGame ? (
        <div className="rounded-2xl border border-white/5 bg-[#0C1220] h-52 animate-pulse" />
      ) : game ? (
        <GameSituation game={game} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-400 text-sm">No live game in progress.</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {TILES.map(({ to, icon: Icon, title, desc, cls, icon_cls }) => (
          <Link key={to} to={to} className={`group rounded-2xl border bg-gradient-to-br p-6 transition-colors duration-300 ${cls}`}>
            <Icon className={`w-6 h-6 mb-3 ${icon_cls}`} />
            <p className="text-white font-semibold flex items-center gap-2">{title} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></p>
            <p className="text-sm text-slate-300/80 mt-1">{desc}</p>
          </Link>
        ))}
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