import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Swords } from "lucide-react";
import AgentOpinion from "@/components/warroom/AgentOpinion";
import WarRoomVerdict from "@/components/warroom/WarRoomVerdict";
import { buildFilmIntel } from "@/lib/filmIntel";
import FilmIntelBanner from "@/components/film/FilmIntelBanner";
import { runWarRoom, rosterContext, gameContext } from "@/lib/warRoom";

const PRESETS = [
  "Should we leave our starter in for one more inning?",
  "Should we intentionally walk this batter?",
  "Should we send the runner on the next pitch?",
  "Which reliever gives us the best matchup right now?",
];

export default function WarRoom() {
  const qc = useQueryClient();
  const { data: games } = useQuery({ queryKey: ["liveGame"], queryFn: () => base44.entities.Game.filter({ status: "live" }, "-created_date", 1) });
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: decisions } = useQuery({ queryKey: ["decisions"], queryFn: () => base44.entities.Decision.list("-created_date", 5) });
  const { data: films } = useQuery({ queryKey: ["films"], queryFn: () => base44.entities.GameFilm.list("-created_date", 20) });

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const game = games?.[0];

  const debate = async (q) => {
    setLoading(true);
    setResult(null);
    setError("");
    setQuestion(q);
    try {
    const res = await runWarRoom({
      question: q,
      game: gameContext(game),
      roster: rosterContext(players),
      filmIntel: buildFilmIntel(films),
    });
    setResult(res);
    qc.invalidateQueries({ queryKey: ["decisions"] });
    } catch (e) {
      setError("The connection dropped while the coaching staff was debating. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">War Room</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Eight AI coaches. One decision.</h1>
      </header>

      <FilmIntelBanner films={films} />

      <div className="rounded-2xl border border-white/5 bg-[#0A0F18] p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => debate(p)} disabled={loading}
              className="text-xs px-3.5 py-2 rounded-full border border-white/10 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300 transition-colors disabled:opacity-40">
              {p}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2}
            placeholder="Or ask your own — e.g. 'What happens if we steal here?'"
            className="bg-[#0C1220] border-white/10 text-slate-200 placeholder:text-slate-600 resize-none" />
          <Button onClick={() => question.trim() && debate(question.trim())} disabled={loading || !question.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold sm:h-auto h-11 sm:px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Swords className="w-4 h-4 mr-2" /> Debate</>}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5 text-sm text-red-300">{error}</div>
      )}

      {loading && (
        <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-10 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">The coaching staff is debating…</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-3">
            {(result.agents || []).map((a, i) => <AgentOpinion key={a.agent + i} agent={a} index={i} />)}
          </div>
          <WarRoomVerdict result={result} />
        </div>
      )}

      {!loading && !result && decisions?.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Recent decisions</h2>
          <div className="space-y-2">
            {decisions.map((d) => (
              <div key={d.id} className="rounded-xl border border-white/5 bg-[#0C1220] px-5 py-4">
                <p className="text-xs text-slate-500 mb-1">{d.question}</p>
                <p className="text-sm text-white font-medium">{d.recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}