import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { runWarRoom, rosterContext, gameContext } from "@/lib/warRoom";
import FilmVerdict from "@/components/film/FilmVerdict";

export default function FilmCard({ film, onChanged }) {
  const qc = useQueryClient();
  const [stage, setStage] = useState(null); // "analyzing" | "debating"
  const [open, setOpen] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    setError("");
    setVerdict(null);
    setStage("analyzing");
    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are DiamondMind AI, a baseball game-film analyst. A coach uploaded game film titled "${film.title}".${film.notes ? ` Coach's context: ${film.notes}.` : ""}${film.source === "youtube" ? ` The film is this YouTube video: ${film.video_url} — use the internet to find any available information about this video and its content.` : ""}

Produce a concise coaching breakdown in markdown with these sections:
## What to watch for
## Pitching observations
## Hitting observations
## Defensive & baserunning notes
## Recommended focus for next practice

Base it on the title, context, and any information you can find. Where specifics aren't available, give the sharpest situational guidance for this matchup. Keep it under 350 words, coach-to-coach tone, bullet points.`,
        add_context_from_internet: film.source === "youtube",
      });
      await base44.entities.GameFilm.update(film.id, { analysis });
      setOpen(true);
      onChanged();

      // Immediately hand the film breakdown to the War Room agents.
      setStage("debating");
      const [players, games] = await Promise.all([
        base44.entities.Player.list("readiness", 100),
        base44.entities.Game.filter({ status: "live" }, "-created_date", 1),
      ]);
      const res = await runWarRoom({
        question: `Based on this game film ("${film.title}"), what should we change — pitching, hitting, defense, and baserunning — for our next matchup?`,
        game: gameContext(games?.[0]),
        roster: rosterContext(players),
        filmIntel: `Game film breakdown of "${film.title}"${film.notes ? ` (coach notes: ${film.notes})` : ""}:\n${analysis}\n`,
        extra: "This is a film-review evaluation, not a live in-game call. Frame options as adjustments to make going forward.",
      });
      setVerdict(res);
      qc.invalidateQueries({ queryKey: ["decisions"] });
    } catch (e) {
      setError("The connection dropped during analysis. Please try again.");
    }
    setStage(null);
  };

  const remove = async () => {
    await base44.entities.GameFilm.delete(film.id);
    onChanged();
  };

  const busy = Boolean(stage);

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0C1220] overflow-hidden">
      <div className="aspect-video bg-black">
        {film.source === "youtube" ? (
          <iframe
            src={`https://www.youtube.com/embed/${film.youtube_id}`}
            title={film.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={film.video_url} controls className="w-full h-full" />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-semibold">{film.title}</p>
            {film.notes && <p className="text-xs text-slate-500 mt-1">{film.notes}</p>}
          </div>
          <button onClick={remove} className="text-slate-600 hover:text-red-400 transition-colors shrink-0" aria-label="Delete film">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={analyze} disabled={busy} size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold">
            {busy
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {stage === "analyzing" ? "Breaking down film…" : "War Room debating…"}</>
              : <><Sparkles className="w-4 h-4 mr-2" /> {film.analysis ? "Re-analyze" : "Analyze + War Room"}</>}
          </Button>
          {film.analysis && (
            <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
              {open ? <>Hide report <ChevronUp className="w-3.5 h-3.5" /></> : <>View report <ChevronDown className="w-3.5 h-3.5" /></>}
            </button>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {open && film.analysis && (
          <div className="mt-4 pt-4 border-t border-white/5 prose prose-invert prose-sm max-w-none prose-headings:text-emerald-300 prose-headings:text-sm prose-headings:uppercase prose-headings:tracking-widest prose-p:text-slate-400 prose-li:text-slate-400">
            <ReactMarkdown>{film.analysis}</ReactMarkdown>
          </div>
        )}
        {verdict && <FilmVerdict result={verdict} />}
      </div>
    </div>
  );
}