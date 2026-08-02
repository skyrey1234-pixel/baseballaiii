import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import DesignForm from "@/components/pitchlab/DesignForm";
import DesignCard from "@/components/pitchlab/DesignCard";
import { buildFilmIntel } from "@/lib/filmIntel";
import FilmIntelBanner from "@/components/film/FilmIntelBanner";

export default function PitchLab() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: films } = useQuery({ queryKey: ["films"], queryFn: () => base44.entities.GameFilm.list("-created_date", 20) });
  const { data: designs } = useQuery({ queryKey: ["pitchDesigns"], queryFn: () => base44.entities.PitchDesign.list("-created_date", 20) });

  const pitchers = (players || []).filter((p) => p.role === "pitcher");
  const [pitcher, setPitcher] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const design = async () => {
    setLoading(true);
    setError("");
    try {
      const p = pitchers.find((x) => x.name === pitcher);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the DiamondMind Pitch Design Laboratory — an elite pitching coordinator who designs new pitches from a coach's brief.

Pitcher: ${pitcher}${p ? ` — throws ${p.throws}, ${p.key_stat}, readiness ${p.readiness}/100, mechanics ${p.mechanical_stability}, command risk ${p.command_risk}${p.drift_notes?.length ? `, mechanical drift: ${p.drift_notes.join("; ")}` : ""}` : ""}.
${buildFilmIntel(films)}
Coach's design brief: "${goal}"

Design ONE new pitch. Give it a name, a concrete grip description (seam orientation, finger pressure, wrist position), a release cue, target velocity and spin ranges with units, a spin-direction target on a clock face, the expected movement profile in inches, how it tunnels with his existing arsenal, the counts and matchups where it plays, a 5-step practice progression from dry work to live, and measurable success criteria. In risk_notes, flag workload or mechanical cautions and state clearly that physical experimentation should be supervised by pitching and medical staff. Be specific and quantitative — never vague.`,
        response_json_schema: {
          type: "object",
          properties: {
            pitch_name: { type: "string" },
            grip: { type: "string" },
            release_cue: { type: "string" },
            target_velocity: { type: "string" },
            target_spin: { type: "string" },
            spin_direction: { type: "string" },
            movement_profile: { type: "string" },
            tunneling: { type: "string" },
            usage: { type: "string" },
            progression: { type: "array", items: { type: "string" } },
            success_metrics: { type: "array", items: { type: "string" } },
            risk_notes: { type: "string" },
          },
        },
      });
      await base44.entities.PitchDesign.create({ ...res, pitcher_name: pitcher, goal });
      qc.invalidateQueries({ queryKey: ["pitchDesigns"] });
      setGoal("");
    } catch (e) {
      setError("The connection dropped while designing the pitch. Please try again.");
    }
    setLoading(false);
  };

  const remove = async (d) => {
    await base44.entities.PitchDesign.delete(d.id);
    qc.invalidateQueries({ queryKey: ["pitchDesigns"] });
  };

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Pitch Design Lab</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Build a pitch that doesn't exist yet</h1>
      </header>

      <FilmIntelBanner films={films} />

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2">
          <DesignForm
            pitchers={pitchers} pitcher={pitcher} setPitcher={setPitcher}
            goal={goal} setGoal={setGoal} onSubmit={design} loading={loading}
          />
        </div>
        <div className="lg:col-span-3 space-y-5">
          {error && <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5 text-sm text-red-300">{error}</div>}
          {loading && (
            <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-10 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Modeling grip, spin axis, movement, and tunneling…</p>
            </div>
          )}
          {designs?.length ? designs.map((d) => <DesignCard key={d.id} design={d} onDelete={remove} />) : (
            !loading && <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-600">
              Pick a pitcher, describe the pitch you want, and the lab will build it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}