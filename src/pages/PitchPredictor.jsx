import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Crosshair } from "lucide-react";
import PredictionResult from "@/components/pitch/PredictionResult";
import { buildFilmIntel } from "@/lib/filmIntel";
import FilmIntelBanner from "@/components/film/FilmIntelBanner";

const PITCHES = ["None (first pitch)", "Four-seam fastball", "Two-seam fastball", "Slider", "Curveball", "Changeup", "Cutter", "Sinker", "Splitter"];

export default function PitchPredictor() {
  const { data: games } = useQuery({ queryKey: ["liveGame"], queryFn: () => base44.entities.Game.filter({ status: "live" }, "-created_date", 1) });
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: films } = useQuery({ queryKey: ["films"], queryFn: () => base44.entities.GameFilm.list("-created_date", 20) });
  const game = games?.[0];
  const pitcher = (players || []).find((p) => p.role === "pitcher");

  const [form, setForm] = useState({ balls: "1", strikes: "2", outs: "1", inning: "6", batter: "", prev: "Four-seam fastball", runners: "Runner on first" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const predict = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are DiamondMind AI, an elite baseball pitch-prediction engine. Predict the OPPONENT pitcher's most likely next pitch and advise our batter/coaching staff — or, if our pitcher is throwing, recommend pitch selection. Be specific and quantitative, in the style of professional analytics.

Game context: ${game ? `vs ${game.opponent}, ${game.half} of inning ${game.inning}, score ${game.our_score}-${game.their_score}.` : "Simulated game situation."}
Our pitcher on record: ${pitcher ? `${pitcher.name} — readiness ${pitcher.readiness}/100, mechanics ${pitcher.mechanical_stability}, drift signals: ${(pitcher.drift_notes || []).join("; ") || "none"}.` : "unknown"}
${buildFilmIntel(films)}
Situation: count ${form.balls}-${form.strikes}, ${form.outs} outs, inning ${form.inning}, ${form.runners}. Batter at the plate: ${form.batter || "unknown batter"}. Previous pitch: ${form.prev}.

Produce a realistic prediction with probabilities (integers 0-100), the most dangerous pitch-selection mistake in this situation, and a recommended alternative with a concrete mechanical/behavioral reason (e.g. swing-path or release-point changes).`,
      response_json_schema: {
        type: "object",
        properties: {
          predicted_pitch: { type: "string" },
          predicted_location: { type: "string" },
          pitch_probability: { type: "number" },
          strike_probability: { type: "number" },
          swing_probability: { type: "number" },
          chase_probability: { type: "number" },
          contact_probability: { type: "number" },
          dangerous_mistake: { type: "string" },
          recommended_alternative: { type: "string" },
          reason: { type: "string" },
        },
      },
    });
    setResult(res);
    } catch (e) {
      setError("The connection dropped while analyzing. Please try again.");
    }
    setLoading(false);
  };

  const selectCls = "bg-[#0C1220] border-white/10 text-slate-200";

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Pitch Prediction Engine</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">What's coming next?</h1>
      </header>
      <div className="mb-6"><FilmIntelBanner films={films} /></div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0A0F18] p-6 space-y-4 h-fit">
          <div className="grid grid-cols-3 gap-3">
            {[["Balls", "balls", ["0", "1", "2", "3"]], ["Strikes", "strikes", ["0", "1", "2"]], ["Outs", "outs", ["0", "1", "2"]]].map(([label, key, opts]) => (
              <div key={key}>
                <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">{label}</label>
                <Select value={form[key]} onValueChange={set(key)}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Inning</label>
            <Select value={form.inning} onValueChange={set("inning")}>
              <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
              <SelectContent>{["1","2","3","4","5","6","7","8","9"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Batter</label>
            <Input value={form.batter} onChange={(e) => set("batter")(e.target.value)} placeholder="e.g. #24 Rivera — L, pull hitter" className={selectCls + " placeholder:text-slate-600"} />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Previous pitch</label>
            <Select value={form.prev} onValueChange={set("prev")}>
              <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
              <SelectContent>{PITCHES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Runners</label>
            <Select value={form.runners} onValueChange={set("runners")}>
              <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Bases empty", "Runner on first", "Runner on second", "Runners on first and second", "Runner on third", "Bases loaded"].map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={predict} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold h-11">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</> : <><Crosshair className="w-4 h-4 mr-2" /> Predict next pitch</>}
          </Button>
        </div>
        <div className="lg:col-span-3">
          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5 text-sm text-red-300 mb-5">{error}</div>
          )}
          {loading && (
            <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-10 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Weighing count, sequence, fatigue, and batter behavior…</p>
            </div>
          )}
          {result && <PredictionResult result={result} />}
          {!loading && !result && (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-600">
              Set the situation and run a prediction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}