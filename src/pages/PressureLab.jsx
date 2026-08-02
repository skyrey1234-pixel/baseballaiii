import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Flame } from "lucide-react";
import ScenarioCard from "@/components/pressure/ScenarioCard";

const cls = "bg-[#141C31] border-white/10 text-slate-100 placeholder:text-slate-500";
const INTENSITY = ["Tournament tight", "Rivalry game", "Championship inning", "Scout in the stands"];

export default function PressureLab() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: scenarios } = useQuery({ queryKey: ["scenarios"], queryFn: () => base44.entities.PressureScenario.list("-created_date", 20) });

  const [form, setForm] = useState({ player_name: "", focus: "", intensity: INTENSITY[0] });
  const [loading, setLoading] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [error, setError] = useState("");
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const p = (players || []).find((x) => x.name === form.player_name);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are DiamondMind AI generating a high-pressure practice rep — not ordinary batting practice.

Athlete: ${form.player_name}${p ? ` (${p.role}, bats ${p.bats}, throws ${p.throws}${p.key_stat ? `, ${p.key_stat}` : ""})` : ""}.
Skill or weakness to stress: ${form.focus}.
Pressure level: ${form.intensity}.

Design ONE scenario the coaching staff can run on the field today. Give it a punchy title, a precise game situation (inning, score, count, outs, runners), the stakes including crowd noise and scoreboard setup, a clear objective defining success, 3-4 constraints that raise difficulty, a real consequence for failure that the whole team feels, and concrete coach_setup instructions for running the rep.

Make it uncomfortable but achievable. Nothing physically unsafe, no punishment running that risks the arm.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" }, situation: { type: "string" }, stakes: { type: "string" },
            objective: { type: "string" }, constraints: { type: "array", items: { type: "string" } },
            consequence: { type: "string" }, coach_setup: { type: "string" },
          },
        },
      });
      await base44.entities.PressureScenario.create({ ...res, player_name: form.player_name, focus: form.focus, status: "generated" });
      qc.invalidateQueries({ queryKey: ["scenarios"] });
    } catch (e) {
      setError("The connection dropped while building the scenario. Please try again.");
    }
    setLoading(false);
  };

  const grade = async (s, notes) => {
    setGradingId(s.id);
    setError("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are DiamondMind AI grading a pressure rep. Grade the process, not the luck of the outcome.

Scenario: ${s.title} — ${s.situation}. Objective: ${s.objective}. Constraints: ${(s.constraints || []).join("; ")}.
What the coach observed: "${notes}"

Score 0-100 on decision_quality, execution, emotional_control, and situational_awareness. Be honest — a good result from a bad decision still grades poorly. Add grade_notes explaining the scores in plain language and one next_step for the following session.`,
        response_json_schema: {
          type: "object",
          properties: {
            grades: {
              type: "object",
              properties: {
                decision_quality: { type: "number" }, execution: { type: "number" },
                emotional_control: { type: "number" }, situational_awareness: { type: "number" },
              },
            },
            grade_notes: { type: "string" }, next_step: { type: "string" },
          },
        },
      });
      await base44.entities.PressureScenario.update(s.id, { ...res, result_notes: notes, status: "graded" });
      qc.invalidateQueries({ queryKey: ["scenarios"] });
    } catch (e) {
      setError("The connection dropped while grading. Please try again.");
    }
    setGradingId(null);
  };

  const remove = async (s) => {
    await base44.entities.PressureScenario.delete(s.id);
    qc.invalidateQueries({ queryKey: ["scenarios"] });
  };

  return (
    <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-orange-300 mb-2">Pressure Lab</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-200 via-rose-200 to-fuchsia-300 bg-clip-text text-transparent">
          Practice that feels like the ninth inning.
        </h1>
      </header>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#221936] to-[#131A2E] p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Athlete</label>
            <Select value={form.player_name} onValueChange={set("player_name")}>
              <SelectTrigger className={cls}><SelectValue placeholder="Select player" /></SelectTrigger>
              <SelectContent>{(players || []).map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Stress this</label>
            <Input value={form.focus} onChange={(e) => set("focus")(e.target.value)} placeholder="e.g. two-strike breaking balls" className={cls} />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Intensity</label>
            <Select value={form.intensity} onValueChange={set("intensity")}>
              <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
              <SelectContent>{INTENSITY.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={generate} disabled={loading || !form.player_name || !form.focus.trim()}
          className="w-full h-11 font-semibold text-[#1A0B04] bg-gradient-to-r from-orange-300 to-rose-300 hover:from-orange-200 hover:to-rose-200">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building the moment…</> : <><Flame className="w-4 h-4 mr-2" /> Generate pressure rep</>}
        </Button>
      </div>

      {error && <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-200">{error}</div>}

      <div className="space-y-5">
        {(scenarios || []).map((s) => (
          <ScenarioCard key={s.id} scenario={s} onGrade={grade} onDelete={remove} grading={gradingId === s.id} />
        ))}
        {!scenarios?.length && !loading && (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-500">
            No scenarios yet. Pick an athlete and the weakness you want to put under pressure.
          </div>
        )}
      </div>
    </div>
  );
}