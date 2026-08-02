import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Dna } from "lucide-react";
import DNACard from "@/components/dna/DNACard";
import ArsenalMap from "@/components/dna/ArsenalMap";
import { buildFilmIntel } from "@/lib/filmIntel";
import EvidenceDemo from "@/components/evidence/EvidenceDemo";

export default function PitchDNA() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: films } = useQuery({ queryKey: ["films"], queryFn: () => base44.entities.GameFilm.list("-created_date", 20) });
  const { data: profiles } = useQuery({ queryKey: ["pitchDNA"], queryFn: () => base44.entities.PitchDNA.list("-created_date", 20) });

  const pitchers = (players || []).filter((p) => p.role === "pitcher");
  const [pitcher, setPitcher] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profile = (profiles || []).find((p) => p.pitcher_name === pitcher);

  const build = async () => {
    setLoading(true);
    setError("");
    try {
      const p = pitchers.find((x) => x.name === pitcher);
      const reps = await base44.entities.PitchRep.filter({ player_name: pitcher, rep_type: "pitch" }, "-created_date", 60);
      const designs = await base44.entities.PitchDesign.filter({ pitcher_name: pitcher }, "-created_date", 10);

      const repLog = reps.map((r) => {
        const m = Object.entries(r.metrics || {}).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, " ")} ${v}`).join(", ");
        return `- ${r.pitch_type || "unknown pitch"} | intent: ${r.intent} | result: ${r.actual_result || "n/a"} | execution ${r.execution_grade}/100 | ${m || "no measurements"} | source: ${r.data_source}`;
      }).join("\n") || "No logged reps yet.";

      const designLog = designs.map((d) => `- ${d.pitch_name}: target ${d.target_velocity}, ${d.target_spin}, ${d.movement_profile}`).join("\n") || "No designed pitches.";

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are DiamondMind AI building a PITCH DNA profile — a persistent identity for every pitch in a pitcher's arsenal, plus a map of how those pitches relate to one another.

Pitcher: ${pitcher}${p ? ` — throws ${p.throws}, ${p.key_stat}, mechanics ${p.mechanical_stability}, command risk ${p.command_risk}${p.drift_notes?.length ? `, drift: ${p.drift_notes.join("; ")}` : ""}` : ""}.

Logged reps (most recent first, ${reps.length} total):
${repLog}

Designed pitches from the Pitch Design Lab:
${designLog}

${buildFilmIntel(films)}
For EACH distinct pitch that appears in the evidence above, produce a DNA entry: a one-line identity, shape_consistency (0-100), fastball_tunnel_match (0-100), chase_potential, strike_reliability, where and when it becomes a dangerous mistake, and how its DNA is trending across the reps. Set confidence to "high" only when many measured reps support it, "experimental" when you are largely inferring from little data.

Then map the arsenal: tunnel_pairs comparing pitches that are thrown together (with a 0-100 tunnel quality and a note on where they separate out of the hand), redundancies where two shapes are too similar to be worth carrying, and arsenal_gaps naming movement directions or speed bands the pitcher lacks. Finish with a plain-language summary of how the whole arsenal plays.

Ground everything in the evidence above. Do not invent measurements that were never recorded — where data is thin, say so and lower confidence.`,
        response_json_schema: {
          type: "object",
          properties: {
            pitches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pitch_type: { type: "string" },
                  identity: { type: "string" },
                  shape_consistency: { type: "number" },
                  fastball_tunnel_match: { type: "number" },
                  chase_potential: { type: "string", enum: ["low", "moderate", "high"] },
                  strike_reliability: { type: "string", enum: ["low", "moderate", "high"] },
                  mistake_danger: { type: "string" },
                  trend: { type: "string" },
                  confidence: { type: "string", enum: ["high", "moderate", "experimental"] },
                },
              },
            },
            tunnel_pairs: { type: "array", items: { type: "object", properties: { pair: { type: "string" }, tunnel_quality: { type: "number" }, note: { type: "string" } } } },
            redundancies: { type: "array", items: { type: "string" } },
            arsenal_gaps: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
          },
        },
      });

      const payload = { ...res, pitcher_name: pitcher, rep_count: reps.length };
      if (profile) await base44.entities.PitchDNA.update(profile.id, payload);
      else await base44.entities.PitchDNA.create(payload);
      qc.invalidateQueries({ queryKey: ["pitchDNA"] });
    } catch (e) {
      setError("The connection dropped while sequencing the arsenal. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Pitch DNA</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Every pitch has an identity.</h1>
        <p className="text-sm text-slate-500 mt-2">Built from logged reps, designed pitches, and film intel — then tracked as it changes.</p>
      </header>

      <div className="rounded-2xl border border-white/5 bg-[#0A0F18] p-6 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Pitcher</label>
          <Select value={pitcher} onValueChange={setPitcher}>
            <SelectTrigger className="bg-[#0C1220] border-white/10 text-slate-200"><SelectValue placeholder="Select a pitcher" /></SelectTrigger>
            <SelectContent>{pitchers.map((p) => <SelectItem key={p.id} value={p.name}>{p.name} — #{p.number}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={build} disabled={loading || !pitcher} className="bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold h-11 sm:px-6">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sequencing…</> : <><Dna className="w-4 h-4 mr-2" /> {profile ? "Rebuild DNA" : "Build DNA profile"}</>}
        </Button>
      </div>

      {error && <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5 text-sm text-red-300">{error}</div>}

      {loading && (
        <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-10 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Reading rep history, shapes, and tunnels…</p>
        </div>
      )}

      {!loading && profile && (
        <div className="space-y-6">
          <p className="text-xs text-slate-600">Built from {profile.rep_count} logged rep{profile.rep_count === 1 ? "" : "s"}.</p>
          <ArsenalMap dna={profile} />
          <EvidenceDemo
            entityName="PitchDNA"
            record={profile}
            subject={`${profile.pitcher_name} pitching from the mound`}
            fix={profile.pitches?.[0]
              ? `A ${profile.pitches[0].pitch_type} thrown with its intended shape — ${profile.pitches[0].identity}`
              : profile.summary}
          />
          <div className="grid md:grid-cols-2 gap-4">
            {(profile.pitches || []).map((pitch, i) => <DNACard key={pitch.pitch_type + i} pitch={pitch} index={i} />)}
          </div>
        </div>
      )}

      {!loading && !profile && (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-600">
          Pick a pitcher to sequence their arsenal. The more reps logged in the Rep Lab, the sharper the DNA.
        </div>
      )}
    </div>
  );
}