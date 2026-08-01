import React from "react";

export default function GameSituation({ game }) {
  const bases = ["3B", "2B", "1B"];
  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0C1220] to-[#0A0F18] p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] tracking-[0.25em] uppercase text-emerald-400">Live · {game.half} {game.inning}</span>
      </div>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">vs {game.opponent}</p>
          <p className="text-5xl md:text-6xl font-bold text-white tabular-nums tracking-tight">
            {game.our_score}<span className="text-slate-600 mx-2">–</span>{game.their_score}
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-white tabular-nums">{game.balls}-{game.strikes}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Count</p>
          </div>
          <div className="text-center">
            <div className="flex gap-1.5 justify-center">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < game.outs ? "bg-amber-400" : "bg-slate-700"}`} />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-2">Outs</p>
          </div>
          <div className="text-center">
            <div className="relative w-10 h-10 mx-auto">
              {bases.map((b, i) => {
                const on = (game.runners || []).includes(b);
                const pos = ["left-0 top-1/2 -translate-y-1/2", "left-1/2 top-0 -translate-x-1/2", "right-0 top-1/2 -translate-y-1/2"][i];
                return <span key={b} className={`absolute ${pos} w-3.5 h-3.5 rotate-45 rounded-[2px] ${on ? "bg-emerald-400" : "bg-slate-700"}`} />;
              })}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-2">Bases</p>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-x-10 gap-y-2 text-sm">
        <p><span className="text-slate-500">On the mound:</span> <span className="text-white font-medium">{game.current_pitcher}</span></p>
        <p><span className="text-slate-500">At the plate:</span> <span className="text-white font-medium">{game.current_batter}</span></p>
      </div>
    </div>
  );
}