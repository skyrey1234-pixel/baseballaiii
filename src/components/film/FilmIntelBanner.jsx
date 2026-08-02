import React from "react";
import { Link } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import { analyzedFilms } from "@/lib/filmIntel";

export default function FilmIntelBanner({ films }) {
  const analyzed = analyzedFilms(films);

  if (!analyzed.length) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#0C1220] px-5 py-3.5 flex items-center gap-3 text-sm text-slate-500">
        <Clapperboard className="w-4 h-4 shrink-0 text-slate-600" />
        <span>
          No film intel loaded yet.{" "}
          <Link to="/game-film" className="text-emerald-400 hover:text-emerald-300">Add a YouTube link or video</Link>{" "}
          and run its breakdown to feed this analysis.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] px-5 py-3.5 flex items-start gap-3">
      <Clapperboard className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
      <div className="text-sm">
        <span className="text-emerald-300 font-medium">Using film intel from {analyzed.length} breakdown{analyzed.length > 1 ? "s" : ""}:</span>{" "}
        <span className="text-slate-400">{analyzed.slice(0, 5).map((f) => f.title).join(" · ")}</span>
      </div>
    </div>
  );
}